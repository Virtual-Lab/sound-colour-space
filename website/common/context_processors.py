from django.contrib.sites.models import Site
from django.conf import settings # import the settings file

def api_url(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'API_URL': settings.API_URL}

def media_url(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'MEDIA_URL': settings.MEDIA_URL}


def base_url(request, slash=False):
    """
    Return a BASE_URL template context for the current request.
    """
    domain = Site.objects.get_current().domain
    protocol = 'https' if request.is_secure() else 'http'
    root = "%s://%s" % (protocol, domain)
    if slash:
        root += '/'

    return {'BASE_URL': root,}
