import operator

from django.conf import settings
from django.conf.urls import *
from easy_thumbnails.files import get_thumbnailer
from haystack.inputs import Raw, AutoQuery
from haystack.query import SearchQuerySet, EmptySearchQuerySet, SQ
from museum.models import Entry, Author, License, Experiment, Collection
from tastypie import fields
from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from tastypie.paginator import Paginator
from tastypie.resources import ALL_WITH_RELATIONS
from tastypie.resources import ModelResource

from django.utils.translation import ugettext as _

SEARCH_SCOPES = {
    'fulltext': {
        'title': _('Fulltext'),
        'query_class': AutoQuery
    },
    'title': {
        'title': _('Title'),
        'query_class': AutoQuery
    },
    'author': {
        'title': _('Author'),
        'query_class': AutoQuery
    },
}

def get_query_class_for_item(item):
    query_class = SEARCH_SCOPES[item['scope']]['query_class']
    return query_class(item['term'])


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

        include_resource_uri = True  # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'first_name': ('icontains',),
            'last_name': ('icontains',),
            'pseudonym': ('icontains', 'startswith'),
            'date_of_birth': ('icontains', 'startswith'),
            'date_of_death': ('icontains', 'startswith'),
        }

        ordering = {
            'first_name',
            'last_name',
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

        include_resource_uri = True  # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'label': ('icontains',),
        }


class ExperimentResource(ModelResource):
    uri = fields.CharField(blank=True, readonly=True)

    class Meta:
        queryset = Experiment.objects.all()
        resource_name = 'experiment'
        detail_uri_name = 'slug'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id', 'created', 'modified', 'slug']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True  # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'title': ('icontains',),
        }

        ordering = {
            'title',
        }

    def dehydrate_uri(self, bundle):
        return bundle.obj.get_absolute_url()


class EntryResource(ModelResource):
    image = fields.FileField(attribute='image', blank=True, null=True, readonly=True)
    author = fields.ToManyField(AuthorResource, 'author', full=True, blank=True, null=True)

    license = fields.ToManyField(LicenseResource, 'license', full=True, blank=True, null=True)

    # related = fields.ToManyField('self', 'related', full=False, blank=True, null=True)
    related = fields.ListField(blank=True)

    # source = fields.ForeignKey(SourceResource, 'source', full=True, blank=True, null=True)
    # link = fields.ForeignKey(LinkResource, 'gallery', full=True, blank=True, null=True)

    uri = fields.CharField(blank=True, readonly=True)
    tags = fields.ListField(blank=True)

    class Meta:
        queryset = Entry.objects.all()
        resource_name = 'entry'
        detail_uri_name = 'doc_id'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True  # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'author': ALL_WITH_RELATIONS,
            'image': ALL_WITH_RELATIONS,
            'portrayed_object_date': ('icontains',),
            'title': ('icontains', 'iexact'),
            'subtitle': ('icontains', 'iexact'),
            'description': ('icontains',),
            'date': ['exact', 'gt', 'gte', 'lt', 'lte', 'range']
        }

        ordering = {
            'title',
            'author',
            'date',
        }

    def dehydrate_uri(self, bundle):
        return bundle.obj.get_absolute_url()

    def dehydrate_image(self, bundle):

        try:
            image_size = bundle.request.GET['image_size']
        except:
            image_size = "medium"

        thumbnail = get_thumbnailer(bundle.obj.image)[image_size]

        image = ({
            'url': thumbnail.url,
            'width': thumbnail.width,
            'height': thumbnail.height
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
                name="api_get_entry_search"),
        ]

    # Custom endpoint for search
    def get_search(self, request, **kwargs):

        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        #####################################################################
        #  get query for multiple time used key, like:
        # ?q=author::peter&q=fulltext::blabla&tags=foo,bar,etc
        #####################################################################

        query = None

        for x in request.GET.lists():
            if x[0] == 'q':
                query = x[1]

        order_by = request.GET.get('order_by', 'date')


        search_items = []

        if not query:
            # raise BadRequest('Please supply the search parameter (e.g. "/api/' + settings.API_VERSION + '/entry/search/?q=Term::Newton")')
            results = SearchQuerySet().models(Entry).all().order_by(order_by)

        else:
            '''
            search_items = [
                {
                    'scope': 'author',
                    'term': 'Zarlino'
                },
                {
                    'scope': 'fulltext',
                    'term': 'blabla'
                },
            ]
            '''

            for item in query:
                search_item = item.split('::')
                search_items.append({'scope': search_item[0], 'term': search_item[1]})

            print (search_items)

            # narrow down tags
            # if search_items['Tag']:
            #    results = results.filter(reduce(operator.and_, [SQ(tags=tag_name) for tag_name in search_items['Tag']]))

            # filter search masks
            match = request.GET.get('match', 'OR')
            op = SQ.OR if (match == 'OR') else SQ.AND

            sq = SQ()

            for item in search_items:
                # print (item['scope'])
                kwargs = {
                    # ie: author=AutoQuery
                    item['scope']: get_query_class_for_item(item),
                }
                print (kwargs)

                sq.add(SQ(**kwargs), op)

            results = SearchQuerySet().models(Entry).filter(sq).order_by(order_by)

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

        #object_list['meta']['search_scope'] = SEARCH_SCOPES
        object_list['meta']['search_query'] = search_items
        object_list['meta']['order_by'] = order_by


        # object_list['meta']['search_query'] = {"Type": search_items['Type'], "Term": search_items['Term'], "Tag": search_items['Tag']}

        self.log_throttled_access(request)

        return self.create_response(request, object_list)


class CollectionResource(ModelResource):
    uri = fields.CharField(blank=True, readonly=True)
    entry = fields.ToManyField(EntryResource, 'entry', use_in='detail', full=True, blank=True, null=True)

    class Meta:
        queryset = Collection.objects.all()
        resource_name = 'collection'
        detail_uri_name = 'slug'
        always_return_data = True

        authentication = Authentication()
        authorization = Authorization()

        excludes = ['id', 'created', 'modified', 'slug']

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get"]

        include_resource_uri = True  # ATTENTION: This needs to be True for backbone-tastypie to work!!!

        filtering = {
            'title': ('icontains',),
        }
        ordering = {
            'title',
        }

    def dehydrate_uri(self, bundle):
        return bundle.obj.get_absolute_url()

    def dehydrate(self, bundle):

        obj = bundle.obj

        # includes=tescription+date+obj.image
        includes = bundle.request.GET.get('includes')
        if includes:

            entry_qs = obj.entry.all()

            includes = includes.split('+')

            for key in includes:

                # description -> obj.description
                # bundle.data[key] = get_data_for(obj, key)

                # entry_qs = entry_qs.filter(size=1223)

                if key == 'cover':

                    if entry_qs.exists():
                        bundle.data[key] = obj.entry.all()[0].image.url
                else:
                    bundle.data[key] = getattr(obj, key)

        return bundle
