# Source

Download the source locally:

    git clone https://github.com/Sound-Colour-Space/sound-colour-space
    
# Local settings

Create a local_settings.py in the 'website/project' folder with the minimal content of:
    
    import settings
    
    # SECURITY WARNING: keep the secret key used in production secret!
    SECRET_KEY = '91L6Cf'(#{S!"<H%-|Zh/z@$={~s64Xm2"c0v(P?Xx{}]0p{B='
    
    INTERNAL_IPS = ('127.0.0.1')
    
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True
    
    COMPRESS_ENABLED = False
    
    SASS_PROCESSOR_ENABLED = True
    
    # Database
    # https://docs.djangoproject.com/en/dev/ref/settings/#databases
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'soundcolourspace',
            'USER': 'soundcolourspace', 'PASSWORD': 'YOUR_DB_PASS',
            'HOST': 'localhost',
            'PORT': '',
        }
    }
    
    ATTACHMENT_PATH = settings.BASE_DIR + '/attachments'




# Database

Create a db user with password (refer to 'project/local_settings.py' above)

    createuser soundcolourspace -P

Create the database with user

    createdb soundcolourspace --owner soundcolourspace

# Install python

Create virtual environment

    virtualenv2 env
    source env/bin/activate

Install django + other packages

    pip install -r requirements.txt
    pip install -r requirements-dev.txt

# Install Node Version 6.9.0 

best with nvm: (https://github.com/creationix/nvm)
    
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
 or:   
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

Install Node 6.9.0:
    nvm install 6.9.0
    
Use Node 6.9.0
    nvm use 6.9.0
     
# Install javascript packages
    npm install
    
    
# Start django server
    cd website
    ./manage.py runserver 0.0.0.0:8000
    
# Start gulp proxy (for auto reload frontend file changes)
    gulp
    
    
# Preview
The website is served under http://localhost:8000 and http://localhost:3000 (gulp)

# Deployment

    gulp dist

Further deployment steps are documented under [Deploy](deploy.md).
