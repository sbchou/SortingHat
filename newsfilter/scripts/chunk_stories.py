"""
Chunk large file of stories into 20-storie files
"""
import csv
import sys
 
def main(infile):
    with open(infile) as csvfile:
        spamrider = csv.reader(csvfile)
        pusheen = list(spamrider)
        for i in xrange(0,len(pusheen), 20):
            with open('../data/chunk' + str(i) + '.csv', 'w+') as outfile:
                wr = csv.writer(outfile)
                if i == 0:
                    wr.writerows(pusheen[i:i+20])

                elif i + 20 <= len(pusheen):
                    wr.writerow(['title','url','org','body','election_news_confidence'])
                    wr.writerows(pusheen[i:i+20])
                else: 
                    wr.writerow(['title','url','org','body','election_news_confidence'])
                    wr.writerows(pusheen[i:])
 
if __name__ == "__main__":
    main(sys.argv[1])
