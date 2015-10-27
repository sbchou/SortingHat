import sys
import csv

def dedupe(ls):
    seen = set()
    seen_add = seen.add
    return [ x for x in ls if not (x in seen or seen_add(x))]

def main(infile, outfile):
    titles = []
    with open(outfile, 'w') as fp:
        a = csv.writer(fp, delimiter=',')

        ####### issues with weird a######

        with open(infile) as csvfile:
            spamrider = csv.reader(csvfile)
            for row in spamrider:
                print "TITTLES", titles
                print 'THIS', row[0].lstrip().strip()
                if len(row) < 4:
                    import pdb; pdb.set_trace() 
                title_clean = row[0].lstrip().strip().replace('&#8217;', "\'").replace('mln', 'million')
                if title_clean in titles:
                    print 'seen title', title_clean
                    continue
                if row[3] == '':
                    continue
                
                titles.append(title_clean)
                print 'unseen title', title_clean
                body = row[3] 
                if 'mbox' in body:
                    print 'MBOX', title_clean
                    continue
                if body.count('By') > 5:
                    print 'By count', body.count('By'), title_clean
                    continue

                body = body.replace('itoggle caption', '').replace('hide caption', '')
                body = body.replace('&#8217;', "\'")
                body = body.split('\n')
                body = [x.lstrip() for x in body]
                body = [x.strip() for x in body if x.strip()]
                body = dedupe(body)

                body = [' '.join(x.split()) for x in body if x != '' and x != 'i']  
                body = "\n\n".join(body)
                a.writerow([row[0], row[1], row[2], body, row[4]])



if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
