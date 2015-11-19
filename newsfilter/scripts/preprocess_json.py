import glob
import json
import sys

def main(TODAY):
    files = glob.glob('data/' + TODAY + '/' + TODAY + '/*')
    data = []
    for f in files:
        parsed = json.load(open(f, 'r'))
        data.append(parsed)
 
    # uniq titles
    data = { each['title'] : each for each in data }.values()

    #strip whitespace and remove empty
    cleaned_data = []
    for d in data:
        body = d['body'] 
        body = body.strip()
        if 'mbox' in body:
            continue

        if body:
            body = body.split("\n")
            body = "\n".join([p.strip() for p in body if p.strip()])
            d['body'] = body
            cleaned_data.append(d)

    CHUNKSIZE = 20
    for i in xrange(0, len(cleaned_data), CHUNKSIZE):
        json.dump(cleaned_data[i:i+CHUNKSIZE], open('data/' + TODAY + '/' + str(i) + '.json', 'w'))

 
                

if __name__ == "__main__":
    main(sys.argv[1])