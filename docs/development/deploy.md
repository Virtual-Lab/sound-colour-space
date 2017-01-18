All steps require server login and virtual env activation (see below)

# Server Login + Virtual Env activation

    ssh user@sound-colour-space.zhdk.ch
    
    cd /var/www/sound-colour-space.zhdk.ch/sound-colour-space
    source env/bin/actrivate
    cd website
    
# Update from github
    git pull
    ./manage.py collectstatic

# Sync from MAdeK
 commands need set uuid from MAdeK + fixed category ("tone_systems" or "colour_systems")
 
    ./manage.py sync_madek e9f34e2c-b844-4297-b701-7e512c65e3b5 colour_systems
    ./manage.py sync_madek 73114b11-08de-42a9-ba36-864d9c1b5641 tone_systems
    
# Import annotations
CAUTION: this will delete all existing annotations that match first columns (ie filename or keyword)in the newly imported CSV file
    
Annotations:

    ./manage.py import_annotations diagrams /path/to/_items_toneSystems_annotations_170105.csv

Sets:

    ./manage.py import_annotations sets /path/to/_itemGroups_annotations_170108.csv
    
Keywords:

    ./manage.py import_annotations keywords /path/to/__madek_keywords_toneSystems_LB_dm.csv


Parse Annotations (creates reference links in markdown for related diagrams, primary and secondary sources):

    ./manage.py parse_related diagrams
    
Parse set annotations

    ./manage.py parse_related sets


# Rebuild search index (confirm with "yes")
    ./manage.py rebuild_index
    
# Restart webserver
    sudo supervisorctl
    restart sound-colour-space.zhdk.ch:web.test.sound-colour-space.zhdk.ch
    exit
    
# Status of webserver
    sudo supervisorctl
    status
    exit
    
 
    
