import datetime
from haystack import indexes
from museum.models import Entry, Author


class EntryIndex(indexes.SearchIndex, indexes.Indexable):

    fulltext = indexes.CharField(document=True, use_template=True)

    title = indexes.CharField(model_attr='title', null=True)

    #category = indexes.CharField(model_attr='category', null=True)

    portrayed_object_date = indexes.CharField(model_attr='portrayed_object_date', null=True)
    portrayed_object_date_auto = indexes.EdgeNgramField(model_attr='portrayed_object_date', null=True)

    date = indexes.DateTimeField(model_attr='date', null=True)

    author = indexes.MultiValueField()

    # author last_name for sorting
    author__last_name = indexes.MultiValueField()


    def get_model(self):
        return Entry

    def prepare(self, object):
        self.prepared_data = super(EntryIndex, self).prepare(object)
        self.prepared_data['tags'] = [tag.name for tag in object.tags.all()]

        self.prepared_data['category'] = object.category


        return self.prepared_data

    def prepare_author(self, obj):
        if obj.author is not None:
            return [author.get_full_name() for author in obj.author.order_by('-last_name')]

    def prepare_author__last_name(self, obj):
        if obj.author is not None:
            return [author.last_name for author in obj.author.order_by('-last_name')]

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        # filter left for example, would make sense for blog with publish__lte
        return self.get_model().objects.filter(created__lte=datetime.datetime.now())

