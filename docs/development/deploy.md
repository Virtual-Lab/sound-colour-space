All steps require server login and virtual env activation (see below)

# Source code

https://github.com/Sound-Colour-Space/sound-colour-space

# Server Login + Virtual Env activation

    ssh user@sound-colour-space.zhdk.ch
    
    cd /var/www/sound-colour-space.zhdk.ch/sound-colour-space
    source env/bin/activate
    cd website
    
# Update from github
    git pull
    ./manage.py collectstatic

# Rebuild search index (confirm with "yes")
    ./manage.py rebuild_index
    
# Restart webserver
    sudo supervisorctl
    restart sound-colour-space.zhdk.ch:web.sound-colour-space.zhdk.ch
    exit
    
# Status of webserver
    sudo supervisorctl
    status
    exit
    
 
    
