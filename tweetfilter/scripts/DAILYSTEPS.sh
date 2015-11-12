TODAY=$(date +"%d-%m-%Y");
scp -r soph@cat3:/home/users/pralav/electome_latest/electome/data/outputs/dump/recent_dumps/$TODAY ../data/ 

#for f in *.json; do (cat "${f}"; echo ',') >> finalfile.txt; done
# to cat files together separated by a comma

 python ../../scripts/preproc.py 2015-11-05.csv 2015-11-05-clean.csv
