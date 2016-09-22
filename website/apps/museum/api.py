from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import Authorization

from django.conf.urls import *
from tastypie.paginator import Paginator
from tastypie.exceptions import BadRequest
from tastypie.resources import ModelResource
from tastypie.utils import trailing_slash

from haystack.query import SearchQuerySet, EmptySearchQuerySet
from haystack.inputs import Raw

from museum.models import Entry, Author, License
from django.conf import settings


class AuthorResource(ModelResource):

    class Meta:
        queryset = Author.objects.all()
        resource_name = 'author'
        detail_uri_name = 'uuid'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id', 'created', 'modified']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'first_name': ('icontains',),
            'last_name': ('icontains',),
            'pseudonym': ('icontains', 'startswith'),
            'date_of_birth': ('icontains', 'startswith'),
            'date_of_death': ('icontains', 'startswith'),
        }


class LicenseResource(ModelResource):

    class Meta:
        queryset = License.objects.all()
        resource_name = 'license'
        detail_uri_name = 'uuid'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id', 'created', 'modified']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'label': ('icontains',),
        }

'''
class SourceResource(ModelResource):

    license = fields.ForeignKey(LicenseResource, 'license', full=True, blank=True, null=True)

    class Meta:
        queryset = Source.objects.all()
        resource_name = 'source'
        detail_uri_name = 'uuid'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id', 'created', 'modified']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'owner': ('icontains',),
            'source': ('icontains',),
        }
'''


class EntryResource(ModelResource):

    image = fields.FileField(attribute='image', blank=True, null=True, readonly=True)
    author = fields.ToManyField(AuthorResource, 'author', full=True, blank=True, null=True)

    #related = fields.ToManyField('self', 'related', full=False, blank=True, null=True)
    related = fields.ListField(blank=True)

    #source = fields.ForeignKey(SourceResource, 'source', full=True, blank=True, null=True)
    #link = fields.ForeignKey(LinkResource, 'gallery', full=True, blank=True, null=True)

    uri = fields.CharField(blank=True, readonly=True)
    tags = fields.ListField(blank=True)

    class Meta:
        queryset = Entry.objects.all()
        resource_name = 'entry'
        detail_uri_name = 'uuid'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            #'author': ALL_WITH_RELATIONS,
            'image': ALL_WITH_RELATIONS,
            'portrayed_object_date': ('icontains',),
            'title': ('icontains',),
            'subtitle': ('icontains',),
            'description': ('icontains',),
        }

    def dehydrate_uri(self, bundle):
        return bundle.obj.get_absolute_url()

    def dehydrate_image(self, bundle):
        image = ({
            'url': bundle.obj.image,
            'width': bundle.obj.image.width,
            'height': bundle.obj.image.height
        })
        return image

    def dehydrate_tags(self, bundle):
        return [tag.name for tag in bundle.obj.tags.all()]

    def dehydrate_related(self, bundle):

        related_entries = []
        for related in bundle.obj.related.all():
            related_entries.append({
                'title': related.title,
                'uri': related.get_absolute_url()
            })

        return related_entries


    def save_m2m(self, bundle):
        """
        Save tags through the TagManager
        """
        super(EntryResource, self).save_m2m(bundle)

        # Add the tags if any are present
        tags = bundle.data.get('tags', [])
        if tags:
            bundle.obj.tags.set(*bundle.data['tags'])  # could also 'add' instead of set

    # Custom search endpoint
    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search/?$" % (self._meta.resource_name), self.wrap_view('get_search'),
                name="api_get_search"),
        ]

    # Custom endpoint for search
    def get_search(self, request, **kwargs):

        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        query = request.GET.get('q', None)
        if not query:
            raise BadRequest('Please supply the search parameter (e.g. "/api/' + settings.API_VERSION + '/entry/search/?q=Newton")')

        #fulltext = SearchQuerySet().models(Entry).auto_query(query)
        #t = SearchQuerySet().models(Entry).autocomplete(title_auto=query)
        #a = SearchQuerySet().models(Entry).autocomplete(author_auto=query)
        #ap = SearchQuerySet().models(Entry).autocomplete(pseudonym_auto=query)

        #results = t | a | ap

        results = SearchQuerySet().models(Entry).order_by('date').filter(text=Raw(query))

        if not results:
            results = EmptySearchQuerySet()

        paginator = Paginator(request.GET, results, resource_uri='/api/' + settings.API_VERSION + '/entry/search/')

        bundles = []
        for result in paginator.page()['objects']:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundles.append(self.full_dehydrate(bundle))

        object_list = {
            'meta': paginator.page()['meta'],
            'objects': bundles
        }
        object_list['meta']['search_query'] = query

        self.log_throttled_access(request)
        return self.create_response(request, object_list)







