# in root
TODAY=$(date +"%d-%m-%Y") &&
mkdir data/$TODAY &&
scp -r soph@cat3:/home/users/pralav/electome_latest/electome/data/outputs/dump/recent_dumps/$TODAY data/$TODAY &&
echo 'Fetched files from server' &&

for f in data/$TODAY/$TODAY/*.json; do (cat "${f}"; echo ",") >> data/$TODAY/$TODAY-all.json; done &&
 sort -u data/$TODAY/$TODAY-all.json >> data/$TODAY/$TODAY-uniq.json &&
 
python scripts/preprocess_json.py $TODAY &&
echo 'preprocessed data' &&
#cp data/$TODAY/20.json private/ &&
#echo 'moved 20 to private meteor folder'

#yes local is 3001
mongoimport -h localhost:3001 --db meteor --collection articles --type json --file data/$TODAY/$TODAY-CLEAN.json --jsonArray &&
echo 'imported files to mongodb' &&


CMD=`meteor mongo -U sorting-hat.meteor.com | tail -1 | sed 's_mongodb://\([a-z0-9\-]*\):\([a-f0-9\-]*\)@\(.*\)/\(.*\)_mongoimport -u \1 -p \2 -h \3 -d \4 -c articles --type json --jsonArray_'` &&

$CMD data/$TODAY/$TODAY-CLEAN.json &&
echo 'imported files to production'