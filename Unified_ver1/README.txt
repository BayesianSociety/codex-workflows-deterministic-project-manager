# Latest 13F per manager (default)
python unified_13f.py --ciks-file managers.txt --out data --user-agent "MyApp contact@email.com"

# List historical periods available (no download)
python unified_13f.py --ciks-file managers.txt --list-periods --out data

# Download a specific older period
python unified_13f.py --ciks-file managers.txt --period 2023-09-30 --out data

# Download multiple periods
python unified_13f.py --ciks-file managers.txt --period 2022-12-31 --period 2023-03-31

# Download from an existing filings.csv
python unified_13f.py --filings-csv outputs_weekly/filings.csv --out data

# Force re-download
python unified_13f.py --ciks-file managers.txt --latest --force


---------------------------------------------------------------------------------------------------------------------
Error:
python3 unified_13f.py --ciks-file managers.txt --out data --user-agent "MyExp
lorer biuro.fundation@gmail.com"
Traceback (most recent call last):
  File "/home/postnl/SEC/Unified_ver1/unified_13f.py", line 273, in <module>
    main()
  File "/home/postnl/SEC/Unified_ver1/unified_13f.py", line 249, in main
    xml = download_infotable_xml(client, cik, acc)
  File "/home/postnl/SEC/Unified_ver1/unified_13f.py", line 144, in download_infotable_xml
    return client.get_bytes(url)
  File "/home/postnl/SEC/Unified_ver1/unified_13f.py", line 42, in get_bytes
    r.raise_for_status()
  File "/usr/lib/python3/dist-packages/requests/models.py", line 943, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: https://www.sec.gov/Archives/edgar/data/1029160/000114036113021038/0001140361-13-021038-index-headers.html

python3 unified_13f.py --ciks-file managers.txt --out data --user-agent "MyExplorer biuro.fundation@gmail.com"
python3 unified_13f.py --ciks-file managers.txt --list-periods --out data --user-agent "MyExplorer biuro.fundation@gmail.com"
python3 unified_13f.py --ciks-file managers.txt --period 2025-06-30 --out data --user-agent "MyExplorer biuro.fundation@gmail.com"
python3 unified_13f.py --ciks-file managers.txt --period 2025-03-31 --period 2025-06-30 --out data --user-agent  "MyExplorer biuro.fundation@gmail.com"
