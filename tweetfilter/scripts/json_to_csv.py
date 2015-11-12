import json
import unicodecsv

def byteify(input):
    if isinstance(input, dict):
        return {byteify(key):byteify(value) for key,value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input

x = json.load(open('../data/05-11-2015/2015-11-05.json', 'r'))
f = unicodecsv.writer(open("../data/05-11-2015/2015-11-05.csv", "wb+"), encoding='utf-8')

f.writerow(['body',
 'byline',
 'description',
 'title',
 'url',
 'topics',
 'people',
 'org',
 'election_confidence',
 'authors',
 'date_written',
 'orgs',
 'article_id',
 'date_access'])
for entry in x:
    f.writerow(entry.values())
    """
    f.writerow([entry['body'],
        entry['byline'],
        entry['description'],
        entry['title'],
        entry['url'],
        [x.encode('UTF8') for x in entry['topics']],
        [x.encode('UTF8') for x in entry['people']],
        entry['org'],
        entry['election_confidence'],
        entry['authors'], #this is a json of info fix later
        entry['date_written'],
        [x.encode('UTF8') for x in entry['orgs']],
        entry['article_id'],
        entry['date_access']])
    """
 