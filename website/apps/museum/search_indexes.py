import datetime
from haystack import indexes
from museum.models import Entry, Author


class EntryIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.EdgeNgramField(document=True, use_template=True)

    '''
    # We add this for autocomplete.
    title = indexes.CharField(model_attr='title', null=True)
    title_auto = indexes.EdgeNgramField(model_attr='title', null=True)

    year = indexes.CharField(model_attr='year', null=True)
    year_auto = indexes.EdgeNgramField(model_attr='year', null=True)

    author = indexes.CharField(model_attr='author', null=True)
    author_auto = indexes.EdgeNgramField(model_attr='author', null=True)

    pseudonym = indexes.CharField(model_attr='author', null=True)
    pseudonym_auto = indexes.EdgeNgramField(model_attr='author', null=True)

    #pub_date = indexes.DateTimeField(model_attr='pub_date')
    '''

    def get_model(self):
        return Entry

    '''
    def prepare(self, object):
        self.prepared_data = super(EntryIndex, self).prepare(object)

        # Add in tags (assuming there's a M2M relationship to Tag on the model).
        # Note that this would NOT get picked up by the automatic
        # schema tools provided by Haystack.
        self.prepared_data['tags'] = [tag.name for tag in object.tags.all()]

        return self.prepared_data

    def prepare_author(self, obj):
        if obj.author is not None:
            return "%s" % (obj.author.get_full_name())
        return ''

    def prepare_author_auto(self, obj):
        if obj.author is not None:
            return "%s" % (obj.author.get_full_name())
        return ''

    def prepare_pseudonym(self, obj):
        if obj.author is not None:
            return "%s" % (obj.author.pseudonym)
        return ''

    def prepare_pseudonym_auto(self, obj):
        if obj.author is not None:
            return "%s" % (obj.author.pseudonym)
    '''

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        # filter left for example, would make sense for blog with publish__lte
        return self.get_model().objects.filter(created__lte=datetime.datetime.now())


class AuthorIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)

    # title = indexes.CharField(use_template=True)
    # author = indexes.CharField(model_attr='user')
    # pub_date = indexes.DateTimeField(model_attr='pub_date')

    def get_model(self):
        return Author

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.filter(created__lte=datetime.datetime.now())

