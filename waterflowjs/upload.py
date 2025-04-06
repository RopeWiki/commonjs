#!/usr/bin/env python3

'''
Script to take the contents of file, and upload it to a MediaWiki page.
Requires 3 envvars:
  MEDIAWIKI_SITE_URL
  MEDIAWIKI_USERNAME
  MEDIAWIKI_PASSWORD

Requires the `mwclient` pip package.
'''

import mwclient
import os
import sys

site_url, username, password = (
    os.getenv(var)
    for var in ["MEDIAWIKI_SITE_URL", "MEDIAWIKI_USERNAME", "MEDIAWIKI_PASSWORD"]
)

if not all([site_url, username, password]):
    sys.exit(
        "Error: Ensure MEDIAWIKI_SITE_URL, MEDIAWIKI_USERNAME, and MEDIAWIKI_PASSWORD are all set."
    )

site = mwclient.Site(site_url, path="/")
site.login(username, password)

page_name = "MediaWiki:Waterflow.js"  # Replace with the page title you want to edit
edit_summary = "build sync"  # Replace with your edit summary
with open("out/Waterflow.min.js", "r", encoding="utf-8") as file:
    new_content = file.read()

# Fetch the page
page = site.pages[page_name]

# Check if the page exists and edit it
if page.exists:
    page.edit(new_content, summary=edit_summary)
    print(f"Page '{page_name}' successfully edited.")
else:
    print(f"Page '{page_name}' does not exist.")
