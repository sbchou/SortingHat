import csv

with open('V1_20.csv', 'w') as fp:
    a = csv.writer(fp, delimiter=',')

    with open('test_20.csv') as csvfile:
        spamrider = csv.reader(csvfile)
        for row in spamrider:
            print row[0], row[4]
            body = row[3] 
            body = body.split('\n')
            body = [x.lstrip() for x in body]
            body = [x.strip() for x in body if x.strip()]
            body = [' '.join(x.split()) for x in body]  
            body = "\n\n".join(body)
            a.writerow([row[0], row[1], row[2], body, row[4]])