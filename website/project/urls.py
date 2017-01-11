from django.conf.urls import url, include
from django.contrib import admin
from django.views.static import serve
from django.views.generic import TemplateView
from django.conf import settings

from django.conf.urls.static import static

from tastypie.api import Api
from museum.api import EntryResource, AuthorResource, LicenseResource, ExperimentResource, CollectionResource, KeywordResource

admin.autodiscover()

v1_api = Api(api_name=settings.API_VERSION)
v1_api.register(EntryResource())
v1_api.register(AuthorResource())
v1_api.register(LicenseResource())
v1_api.register(ExperimentResource())
v1_api.register(CollectionResource())
v1_api.register(KeywordResource())

urlpatterns = [
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin', admin.site.urls),
    url(r'^admin/', admin.site.urls),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    url(r'^search/', include('haystack.urls')),
    url(r'^', TemplateView.as_view(template_name='index.html'), name='index'),
    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
