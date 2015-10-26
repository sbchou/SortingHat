import csv
titles = []
with open('../data/deduped_25.csv', 'w') as fp:
    a = csv.writer(fp, delimiter=',')


    with open('../data/last_25.csv') as csvfile:
        spamrider = csv.reader(csvfile)
        for row in spamrider: 
            title_clean = row[0].lstrip().strip()
            if title_clean in titles:
                print 'seen title', title_clean
                continue
            if row[3] == '':
                continue
            
            titles.append(title_clean)
            print 'unseen title', title_clean
            body = row[3] 
            body = body.split('\n')
            body = [x.lstrip() for x in body]
            body = [x.strip() for x in body if x.strip()]
            body = [' '.join(x.split()) for x in body]  
            body = "\n\n".join(body)
            a.writerow([row[0], row[1], row[2], body, row[4]])