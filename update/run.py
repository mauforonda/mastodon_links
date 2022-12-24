#!/usr/bin/env python3

from mastodon import Mastodon
from datetime import datetime, timezone,timedelta
from dateutil.parser import isoparse
import re
import os
import json

TOKEN = os.getenv('MASTODON_TOKEN')
BASE_URL = os.getenv('MASTODON_BASE_URL')
LAST_UPDATE_PATH = 'update/update_time'
CATALOG_DIR = 'data'
DIGEST_DIR = 'docs'
DIGEST_SIZE = 250

def make_dirs():
    """
    Create the necessary directories if they don't exist
    """
    for dir in [CATALOG_DIR, DIGEST_DIR]:
        if not os.path.isdir(dir):
            os.mkdir(dir)

def get_last_update():
    """
    When was this last updated
    """

    if os.path.isfile(LAST_UPDATE_PATH):
        with open(LAST_UPDATE_PATH, 'r') as f:
            return isoparse(f.read())
    else:
        return datetime.now(timezone.utc) - timedelta(hours=12)

def set_last_update():
    """
    Set the update time to now
    """

    update_time = datetime.now(timezone.utc)
    with open(LAST_UPDATE_PATH, 'w+') as f:
        f.write(update_time.isoformat())

def get_catalog():
    """"
    Read the full list of links
    """

    catalog_path = f'{CATALOG_DIR}/catalog.json'
    if os.path.isfile(catalog_path):
        with open(catalog_path, 'r') as f:
            return json.load(f)
    else:
        return {}

def set_catalog():
    """
    Write back the full list of links
    """
    catalog_path = f'{CATALOG_DIR}/catalog.json'
    with open(catalog_path, 'w+') as f:
        json.dump(catalog, f)

def collect_newposts(start):
    """
    Get all posts since the last update
    """

    newposts = []
    page = mst.timeline(min_id=start)
    while page:
        newposts.extend(page)
        page = mst.fetch_previous(page)
    return newposts

def filter_links(post):
    """
    Get a list of links in a post
    """
    
    content = post['content']
    return re.findall('(?<=<a href=")([^\"]*)(?=" rel="nofollow noopener noreferrer")', content)

def title_in_card(link, post):
    """
    Is there a card and does it contain a title for the link
    """
    
    card = post['card']
    if card and card['url'] in link:
        return card['title']

def link_shortform_in_content(link, post):
    ellipsis = re.findall('(?<=class\=\"ellipsis\">)([^<]*)(?=\<\/span)', post['content'])
    for e in ellipsis:
        if e in link:
            return e + '...'

def format_links(links, post):
    """
    Add details to a link
    """
    
    formatted_links = []
    
    for link in links:
        
        title = title_in_card(link, post)
        if not title:
            title = link_shortform_in_content(link, post)
            if not title:
                title = link
        
        formatted_links.append({
            'link': link,
            'title': title
        })
    
    return formatted_links

def format_person(post):
    """
    Who published the post
    """
    
    return {i: post['account'][i] for i in ['url', 'display_name']}

def format_message(post):
    """
    What was the content of the post
    """
    
    if post['reblog']:
        message = post['reblog']
    else:
        message = post
        
    return {'url': message['url'], 'content': message['content']}

def process_post(post):
    """
    Update the catalog with information about each link in the post
    """
    
    person = format_person(post)
    time = post['created_at'].isoformat()

    if post['reblog']:
        post = post['reblog']
    
    links = filter_links(post)

    if links:
        
        links = format_links(links, post)
        message = format_message(post)
        
        for link in links:
            
            url = link['link']
            title = link['title']

            if url in catalog.keys():
                
                catalog[url]['latest'] = time

                if person not in catalog[url]['people']:
                    catalog[url]['people'].append(person)
    
                catalog[url]['last_post'] = message
        
            else:
                
                catalog[url] = {
                    'title': title,
                    'latest': time,
                    'last_post': message,
                    'people': [person]
                }

def make_digest():
    """
    Save the last `DIGEST SIZE` links to make a digest
    """
    digest_path = f'{DIGEST_DIR}/links.json'
    segment = [{**{'link': i[0]}, **i[1]} for i in sorted(catalog.items(), key=lambda x: x[1]['latest'], reverse=True)][:DIGEST_SIZE]
    with open(digest_path, 'w+') as f:
        json.dump(segment, f)



make_dirs() # Make the necessary directories 
mst = Mastodon(access_token=TOKEN, api_base_url=BASE_URL) # Prepare to make calls to mastodon
start = get_last_update() # When was this last updated
catalog = get_catalog() # Get the full list of links from past runs
newposts = collect_newposts(start) # Get new posts
for post in reversed(newposts): # Update the list with links from new posts
    process_post(post)
make_digest() # Select the latest links for a digest
set_catalog() # Save back the full list of links
set_last_update() # Set the update time for future runs