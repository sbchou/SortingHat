# in root
TODAY=$(date +"%d-%m-%Y");
mkdir data/$TODAY
scp -r soph@cat3:/home/users/pralav/electome_latest/electome/data/outputs/dump/recent_dumps/$TODAY data/$TODAY

for f in data/$TODAY/$TODAY/*.json; do (cat "${f}"; echo ',') >> data/$TODAY/$TODAY-all.json; done
# to cat files together separated by a comma
# gotta add enclosing json brackets!!!
 python  scripts/json_to_csv.py data/$TODAY/$TODAY-all.json data/$TODAY/$TODAY-all.csv


 python  scripts/preproc.py data/$TODAY/$TODAY-all.csv data/$TODAY/$TODAY-clean.csv
 
python scripts/chunk_stories.py data/$TODAY/$TODAY-clean.csv 20 $TODAY