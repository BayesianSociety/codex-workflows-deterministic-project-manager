#!/usr/bin/env python3
import argparse
import csv
import json
import os
import re
import time
import requests
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple

BASE_EDGAR = "https://www.sec.gov/Archives"
SUBMISSIONS = "https://data.sec.gov/submissions"

###############################################################################
# SEC CLIENT
###############################################################################

class SecClient:
    def __init__(self, user_agent: str, pause: float = 0.15):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent})
        self.pause = pause

    def get_json(self, url: str):
        time.sleep(self.pause)
        r = self.session.get(url)
        r.raise_for_status()
        return r.json()

    def get_text(self, url: str):
        time.sleep(self.pause)
        r = self.session.get(url)
        r.raise_for_status()
        return r.text

    def get_bytes(self, url: str):
        time.sleep(self.pause)
        r = self.session.get(url)
        r.raise_for_status()
        return r.content

###############################################################################
# UTILITIES
###############################################################################

def cik10(cik: str) -> str:
    return cik.zfill(10)

def acc_nodash(acc: str) -> str:
    return acc.replace("-", "")

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def yyyymmdd_to_iso(s: str) -> Optional[str]:
    s = (s or "").strip()
    if re.fullmatch(r"\d{8}", s):
        return datetime.strptime(s, "%Y%m%d").strftime("%Y-%m-%d")
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    return None

###############################################################################
# PERIOD OF REPORT EXTRACTION
###############################################################################

def fetch_period_of_report(client: SecClient, cik: str, accession: str) -> Optional[str]:
    """
    Robust 13F period_of_report extraction.

    Priority:
      1) submission .txt (SEC header) - supports BOTH:
           <PERIOD-OF-REPORT>YYYYMMDD</PERIOD-OF-REPORT>
         and older style:
           CONFORMED PERIOD OF REPORT: YYYYMMDD
      2) XMLs listed in index.json (fallback)
    """
    cik = cik10(cik)
    acc = acc_nodash(accession)

    # 1) submission .txt (most authoritative for old filings)
    txt_url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/{accession}.txt"
    try:
        txt = client.get_text(txt_url)

        # Newer tag style
        m = re.search(
            r"<PERIOD-OF-REPORT>\s*(\d{8})\s*</PERIOD-OF-REPORT>",
            txt,
            re.IGNORECASE
        )
        if m:
            return yyyymmdd_to_iso(m.group(1))

        # Older header style (very common in old filings)
        m = re.search(
            r"CONFORMED PERIOD OF REPORT:\s*(\d{8})",
            txt,
            re.IGNORECASE
        )
        if m:
            return yyyymmdd_to_iso(m.group(1))

    except Exception:
        pass

    # 2) fallback: parse any XMLs in index.json
    idx_url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/index.json"
    try:
        idx = client.get_json(idx_url)
        for f in idx.get("directory", {}).get("item", []):
            if f.get("name", "").lower().endswith(".xml"):
                xml_url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/{f['name']}"
                xml = client.get_bytes(xml_url)
                por = extract_por_from_xml(xml)
                if por:
                    return por
    except Exception:
        pass

    return None

def extract_por_from_xml(xml_bytes: bytes) -> Optional[str]:
    try:
        root = ET.fromstring(xml_bytes)
        for tag in ("periodOfReport", "PERIODOFREPORT"):
            el = root.find(f".//{tag}")
            if el is not None and el.text:
                txt = el.text.strip()
                iso = yyyymmdd_to_iso(txt)
                if iso:
                    return iso
    except Exception:
        pass
    return None

###############################################################################
# INFOTABLE DOWNLOAD + PARSE
###############################################################################

def choose_infotable_from_index(items):
    best = None
    best_score = -999
    for it in items:
        name = it["name"].lower()
        score = 0
        if name.endswith(".xml"):
            score += 1
        if "info" in name:
            score += 3
        if "table" in name:
            score += 2
        if "cal" in name or "schema" in name:
            score -= 2
        if "xsl" in name:
            score -= 5
        if score > best_score:
            best = it["name"]
            best_score = score
    return best

def download_infotable_xml(client, cik, accession) -> Optional[bytes]:
    """
    Robust info table downloader:
      1) Try multiple XML candidates from index.json until one parses as an infoTable.
      2) If not found, parse the main submission .txt to locate the infotable filename.
    """
    cik = cik10(cik)
    acc = acc_nodash(accession)

    # 1) index.json candidates
    idx_url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/index.json"
    try:
        idx = client.get_json(idx_url)
        items = idx.get("directory", {}).get("item", [])
    except Exception:
        items = []

    # rank candidates but try more than one
    xml_items = [it for it in items if it.get("name", "").lower().endswith(".xml")]

    def score_name(n: str) -> int:
        name = n.lower()
        score = 0
        if name.endswith(".xml"):
            score += 1
        if "info" in name:
            score += 3
        if "table" in name:
            score += 2
        if "infotable" in name or "informationtable" in name:
            score += 5
        if "primary" in name:
            score -= 2
        if "schema" in name or "cal" in name or name.endswith(".xsd"):
            score -= 5
        if "xsl" in name:
            score -= 5
        return score

    xml_items.sort(key=lambda it: score_name(it["name"]), reverse=True)

    for it in xml_items[:12]:  # try top N candidates
        name = it["name"]
        url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/{name}"
        try:
            xml = client.get_bytes(url)
            if looks_like_13f_infotable(xml):
                return xml
        except Exception:
            continue

    # 2) fallback: parse submission .txt to locate info table filename
    txt_url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/{accession}.txt"
    try:
        txt = client.get_text(txt_url)
        fn = find_infotable_filename_in_submission_txt(txt)
        if fn:
            url = f"{BASE_EDGAR}/edgar/data/{int(cik)}/{acc}/{fn}"
            content = client.get_bytes(url)

            # If it's XML and looks like an info table, return it.
            if fn.lower().endswith(".xml") and looks_like_13f_infotable(content):
                return content

            # If it is not XML (txt/htm/html), return bytes anyway for saving/debugging.
            # The caller will save it, but parsing to holdings.csv may fail (expected).
            return content

    except Exception:
        pass

    return None


def parse_13f(xml_bytes: bytes) -> List[Dict]:
    """
    Namespace-safe 13F infotable parser.
    Fixes false 'failed' status when XML uses SEC namespaces.
    """
    root = ET.fromstring(xml_bytes)

    def local(tag: str) -> str:
        return tag.split("}", 1)[-1].lower()

    # 1) Primary: find infoTable elements (namespace-agnostic)
    tables = root.findall(".//{*}infoTable")

    # 2) Fallback: detect table-like nodes by child tags
    if not tables:
        for el in root.iter():
            child_tags = {local(c.tag) for c in el}
            if {"cusip", "nameofissuer"} <= child_tags:
                tables.append(el)

    rows = []
    for t in tables:
        row = {}
        for c in t:
            key = local(c.tag)
            val = c.text.strip() if c.text else ""
            row[key] = val
        rows.append(row)

    return rows


def looks_like_13f_infotable(xml_bytes: bytes) -> bool:
    """
    Lightweight validation: does this XML appear to be an information table?
    We check for <infoTable> OR fallback tags.
    """
    try:
        root = ET.fromstring(xml_bytes)
    except Exception:
        return False

    if root.findall(".//infoTable"):
        return True

    # fallback heuristic: any node with both cusip + nameOfIssuer children
    for el in root.iter():
        kids = {c.tag.lower() for c in el}
        if {"cusip", "nameofissuer"} <= kids:
            return True

    return False


def find_infotable_filename_in_submission_txt(submission_txt: str) -> Optional[str]:
    """
    SEC submission .txt is SGML, not strict XML.
    Lines are often:
      <TYPE>INFORMATION TABLE
      <FILENAME>infotable.xml
    (no closing tags).
    This function finds the INFORMATION TABLE document filename.
    """

    # Split into <DOCUMENT> blocks (case-insensitive)
    parts = re.split(r"(?i)<DOCUMENT>", submission_txt)
    for block in parts[1:]:
        # isolate block content up to </DOCUMENT> if present
        block = re.split(r"(?i)</DOCUMENT>", block, maxsplit=1)[0]

        # SGML style: capture TYPE on same line (no </TYPE>)
        m_type = re.search(r"(?im)^\s*<TYPE>\s*([^\r\n<]+)", block)
        if not m_type:
            continue
        dtype = m_type.group(1).strip().upper()

        # Normalize common type variants
        dtype = dtype.replace("-", "").replace(" ", "")

        infotable_types = {
            "INFORMATIONTABLE",
            "INFORMATION",
            "INFOTABLE",
            "INFTABLE",
            "13F",
            "13FINFORMATIONTABLE",
        }

        if dtype in infotable_types:
            m_fn = re.search(r"(?im)^\s*<FILENAME>\s*([^\r\n<\s]+)", block)
            if m_fn:
                return m_fn.group(1).strip()

    # Last resort: any filename line that looks like info/table XML
    m = re.search(
        r"(?im)^\s*<FILENAME>\s*([^\r\n<\s]*(info|table)[^\r\n<\s]*\.(xml|htm|html|txt))",
        submission_txt,
    )
    if m:
        return m.group(1).strip()

    return None



###############################################################################
# PERIOD INDEX
###############################################################################

def load_period_index(path: Path) -> Dict[str, Set[str]]:
    idx = {}
    if path.exists():
        with path.open() as f:
            r = csv.DictReader(f)
            for row in r:
                idx.setdefault(row["cik"], set()).add(row["period_of_report"])
    return idx

def append_period_index(path: Path, cik, period, accession):
    exists = path.exists()
    with path.open("a", newline="") as f:
        w = csv.writer(f)
        if not exists:
            w.writerow(["cik", "period_of_report", "accession"])
        w.writerow([cik, period, accession])

def write_list_periods_csv(findings_path: Path, rows: List[Tuple[str, str, str, str, Optional[str], Optional[str]]]) -> None:
    """
    Writes list-periods output in the requested structure:
    cik,accession,form,filing_date,period_of_report,company_name

    rows items are:
      (cik, accession, form, filing_date, period_of_report, company_name)
    """
    with findings_path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["cik", "accession", "form", "filing_date", "period_of_report", "company_name"])
        for cik, acc, form, filing_date, por, name in rows:
            w.writerow([cik, acc, form, filing_date, por, name])

    # Also print to stdout in the same CSV format
    print("cik,accession,form,filing_date,period_of_report,company_name")
    for cik, acc, form, filing_date, por, name in rows:
        print(f"{cik},{acc},{form},{filing_date},{por},{name}")



###############################################################################
# MAIN PIPELINE
###############################################################################

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ciks-file")
    ap.add_argument("--filings-csv")
    ap.add_argument("--selection", action="append")
    ap.add_argument("--period", action="append")
    ap.add_argument("--latest", action="store_true")
    ap.add_argument("--list-periods", action="store_true")
    ap.add_argument("--out", required=True)
    ap.add_argument("--user-agent", required=True)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    # NEW: default behavior when using --ciks-file (and not listing periods) is "latest"
    # This fixes: running without --latest currently downloads all.
    if args.ciks_file and (not args.list_periods) and (not args.period) and (not args.latest):
        args.latest = True

    out = Path(args.out)
    ensure_dir(out)
    period_index_path = out / "period_index.csv"
    findings_path = out / "findings.csv"

    client = SecClient(args.user_agent)
    existing_periods = load_period_index(period_index_path)

    targets = []

    # === DISCOVERY: BY MANAGER ===
    if args.ciks_file:
        with open(args.ciks_file) as f:
            ciks = [line.strip() for line in f if line.strip()]

        for cik in ciks:
            sub = client.get_json(f"{SUBMISSIONS}/CIK{cik10(cik)}.json")
            entity_name = sub.get("name")

            rec = sub["filings"]["recent"]

            # NEW: submissions often includes reportDate; use it if available
            report_dates = rec.get("reportDate")  # may be missing
            if report_dates is None:
                report_dates = [None] * len(rec.get("form", []))

            for form, acc, date, rep_dt in zip(
                rec["form"],
                rec["accessionNumber"],
                rec["filingDate"],
                report_dates
            ):
                if form in ("13F-HR", "13F-HR/A"):
                    por = yyyymmdd_to_iso(rep_dt) if rep_dt else None
                    if not por:
                        por = fetch_period_of_report(client, cik, acc)

                    targets.append((cik, acc, por, entity_name))
                    if args.latest:
                        break

    # === FILTER BY PERIOD ===
    if args.period:
        targets = [t for t in targets if t[2] in args.period]

    # === LIST PERIODS ONLY ===
    if args.list_periods:
        list_rows = []
        for cik, acc, por, name in targets:
            # We need form + filing_date, so we re-read submissions for this cik
            sub = client.get_json(f"{SUBMISSIONS}/CIK{cik10(cik)}.json")
            rec = sub["filings"]["recent"]
            entity_name = sub.get("name")

            form_val = ""
            filing_date_val = ""

            for form, acc2, filing_date in zip(rec["form"], rec["accessionNumber"], rec["filingDate"]):
                if acc2 == acc:
                    form_val = form
                    filing_date_val = filing_date
                    break

            list_rows.append((cik, acc, form_val, filing_date_val, por, entity_name))

        write_list_periods_csv(findings_path, list_rows)
        return


    # === EXECUTION ===
    for cik, acc, por, _ in targets:
        if por and cik in existing_periods and por in existing_periods[cik] and not args.force:
            continue

        folder = out / cik10(cik) / acc_nodash(acc)
        ensure_dir(folder)

        meta_path = folder / "meta.json"
        holdings_path = folder / "holdings.csv"

        if holdings_path.exists() and not args.force:
            continue

        xml = download_infotable_xml(client, cik, acc)
        if not xml:
            # NEW: write a status file so empty folders have an explanation
            status_path = folder / "status.json"
            with status_path.open("w") as sf:
                json.dump(
                    {"cik": cik, "accession": acc, "period_of_report": por, "status": "failed", "reason": "infotable_xml_not_found"},
                    sf,
                    indent=2,
                )
            continue

        # NEW: always persist the downloaded XML for inspection / reparse workflows
        infotable_path = folder / "infotable.xml"
        try:
            with infotable_path.open("wb") as xf:
                xf.write(xml)
        except Exception:
            pass

        # If it isn't XML, keep a raw copy too (prevents losing .txt/.htm infotables)
        try:
            ET.fromstring(xml)
        except Exception:
            raw_path = folder / "infotable.raw"
            try:
                with raw_path.open("wb") as rf:
                    rf.write(xml)
            except Exception:
                pass
        except Exception:
            pass

        rows = parse_13f(xml)
        if not rows:
            # NEW: write status for parse failure (still leaves infotable.xml saved)
            status_path = folder / "status.json"
            with status_path.open("w") as sf:
                json.dump(
                    {"cik": cik, "accession": acc, "period_of_report": por, "status": "failed", "reason": "infotable_parse_returned_no_rows"},
                    sf,
                    indent=2,
                )
            continue


        with holdings_path.open("w", newline="") as f:
            # Use union of keys across all rows so DictWriter never errors on extra fields (e.g., putcall)
            fieldnames = sorted({k for r in rows for k in r.keys()})
            w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)

        with meta_path.open("w") as f:
            json.dump(
                {"cik": cik, "accession": acc, "period_of_report": por},
                f,
                indent=2,
            )

        if por:
            append_period_index(period_index_path, cik, por, acc)

if __name__ == "__main__":
    main()
