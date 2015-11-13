# in root
TODAY=$(date +"%d-%m-%Y");
mkdir data/$TODAY
scp -r soph@cat3:/home/users/pralav/electome_latest/electome/data/outputs/dump/recent_dumps/$TODAY data/$TODAY

#for f in *.json; do (cat "${f}"; echo ',') >> $TODAY.csv; done
# to cat files together separated by a comma

 python  scripts/preproc.py data/$TODAY/$TODAY.csv data/$TODAY/$TODAY-clean.csv
python scripts/chunk_stories.py data/$TODAY/$TODAY-clean.csv 20