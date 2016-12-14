import os
import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _

from django.db.models import permalink

from taggit.managers import TaggableManager
from taggit.models import TagBase, GenericTaggedItemBase


from common.storage import DataStorage

# generic data path based on uuid for folder and filename for file
def generate_data_path(obj, filename):
    path = "%s/%s" % (obj.uuid, filename)
    return path.replace('-', '/')

class Base(models.Model):
    """Base model."""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    created = models.DateTimeField(_('created'), auto_now_add=True)
    modified = models.DateTimeField(_('modified'), auto_now=True)

    class Meta:
        abstract = True
        ordering = ('-created',)
        get_latest_by = 'created'


class Keyword(Base, TagBase):
    description = models.TextField(_('description'), blank=True, null=True)
    remote_uuid = models.CharField(_('remote_uuid'), max_length=200, blank=True, null=True)

    class Meta:
        verbose_name = _("keyword")
        verbose_name_plural = _("keywords")


class TaggedObject(GenericTaggedItemBase):
    tag = models.ForeignKey(Keyword, related_name="museums_tagged_objects")


class License(Base):
    '''
    madek mapping:
    label -> license:label
    url   -> license: url
    usage -> license:copyright_usage
    '''
    label = models.CharField(_('label'), max_length=200, blank=True, null=True)
    url = models.URLField(_('url'), blank=True, null=True)
    usage = models.TextField(_('usage'), blank=True, null=True)

    remote_uuid = models.CharField(_('remote_uuid'), max_length=200, blank=True, null=True)
    remote_href = models.CharField(_('remote_href'), max_length=200, blank=True, null=True)

    class Meta:
        verbose_name = _('license')
        verbose_name_plural = _('licenses')
        db_table = 'museum_license'
        ordering = ('-label',)

    def __unicode__(self):
        return u'%s' % self.label


'''
class Source(Base):

    # madek mapping:
    # copyright_notice -> madek_core:copyright_notice
    # source -> copyright:source

    copyright_notice = models.TextField(_('copyright_notice'), blank=True, null=True)
    source = models.TextField(_('source'), blank=True, null=True)

    class Meta:
        verbose_name = _('source')
        verbose_name_plural = _('sources')
        db_table = 'museum_source'
        ordering = ('-source',)

    def __unicode__(self):
        return u'%s' % self.source
'''

class Author(Base):
    date_of_birth = models.CharField(_('date of birth'), max_length=200, blank=True, null=True)
    date_of_death = models.CharField(_('date of death'), max_length=200, blank=True, null=True)
    first_name = models.CharField(_('first name'), max_length=200, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=200, blank=True, null=True)
    pseudonym = models.CharField(_('pseudonym'), max_length=200, blank=True, null=True)

    remote_uuid = models.CharField(_('remote_uuid'), max_length=200, blank=True, null=True)
    remote_href = models.CharField(_('remote_href'), max_length=200, blank=True, null=True)

    class Meta:
        verbose_name = _('author')
        verbose_name_plural = _('authors')
        db_table = 'museum_author'
        ordering = ('first_name',)

    def __unicode__(self):
        return u'%s %s' % (self.first_name, self.last_name)

    def get_absolute_url(self):
        return 'authors/%s/' % self.uuid

    def get_full_name(self):
        return u'%s %s' % (self.first_name, self.last_name)


class Attachment(Base):
    """Base Attachment Model"""
    title = models.CharField(_('title'), max_length=200)

    class Meta:
        abstract = True

experiment_store = DataStorage(location=settings.EXPERIMENTS_ROOT, base_url=settings.EXPERIMENTS_URL)

class Experiment(Attachment):
    # slug for url
    slug = models.SlugField(_('slug'), allow_unicode=True)

    cover = models.ImageField(_('cover'), upload_to=generate_data_path, storage=experiment_store, null=True,
                              blank=True)
    # iframe url
    url = models.URLField(_('url'), null=True, blank=True)

    description = models.TextField(_('description'), blank=True, null=True)

    class Meta:
        verbose_name = _('experiment')
        verbose_name_plural = _('experiments')
        db_table = 'museum_experiment'
        ordering = ('title',)

    def __unicode__(self):
        return u'%s' % self.title

    def get_absolute_url(self):
        return 'virtuallab/%s' % self.slug



class Link(Attachment):
    url = models.URLField(_('url'))

    class Meta:
        verbose_name = _('link')
        verbose_name_plural = _('links')
        db_table = 'museum_link'
        ordering = ('-created',)
        get_latest_by = 'created'

    def __unicode__(self):
        return u'%s' % self.title


museum_store = DataStorage(location=settings.DIAGRAMS_ROOT, base_url=settings.DIAGRAMS_URL)

ACCURACY_CHOICES = (
    (1, _("exact")),
    (2, _("month")),
    (3, _("year")),
    (4, _("decennium")),
    (5, _("century")),
    (6, _("unknown"))
)

class Entry(Base):
    """
    Entry model.
    """
    author = models.ManyToManyField(Author, related_name='museums_entries',blank=True)
    license = models.ManyToManyField(License, related_name='museums_entries', blank=True)
    image = models.ImageField(_('image'), max_length=200, upload_to=generate_data_path, storage=museum_store, null=True, blank=True)
    portrayed_object_date = models.CharField(_('portrayed_object_date'), max_length=200, blank=True, null=True)
    date = models.DateField(_('date'), null=True, blank=True)
    date_accuracy = models.IntegerField(choices=ACCURACY_CHOICES, default=3, null=True, blank=True)
    title = models.CharField(_('title'), max_length=200, blank=True, null=True)
    subtitle = models.CharField(_('subtitle'), max_length=200, blank=True, null=True)
    description = models.TextField(_('description'), blank=True, null=True)
    tags = TaggableManager(blank=True, through=TaggedObject)
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, models.SET_NULL, related_name='museums_entries', null=True, blank=True)

    #source = models.ManyToManyField(Source, related_name='museums_entries', blank=True)
    copyright_notice = models.TextField(_('copyright_notice'), blank=True, null=True)
    source = models.TextField(_('source'), blank=True, null=True)

    remote_uuid = models.CharField(_('remote_uuid'), max_length=200, blank=True, null=True)
    remote_href = models.CharField(_('remote_href'), max_length=200, blank=True, null=True)

    doc_id = models.IntegerField(unique=True, null=True, blank=True)

    # related entries
    related = models.ManyToManyField('self', symmetrical=True, blank=True)

    # attachments
    link = models.ManyToManyField(Link, related_name='museums_entries', blank=True)

    class Meta:
        verbose_name = _('diagram')
        verbose_name_plural = _('diagrams')
        db_table = 'museum_entry'
        ordering = ('date',)  # 'doc_id',
        get_latest_by = 'created'

    def __unicode__(self):
        return u'%s [%s]' % (self.title, self.doc_id)


    def get_absolute_url(self):
        return 'diagrams/%s' % self.doc_id


class Collection(Base):
    """
    Set of entries
    """
    entry = models.ManyToManyField(Entry, related_name='museums_collections', blank=True)

    author = models.ManyToManyField(Author, related_name='museums_collections', blank=True)
    title = models.CharField(_('title'), max_length=200, blank=True, null=True)
    slug = models.SlugField(_('slug'), allow_unicode=True, blank=True, null=True)
    subtitle = models.CharField(_('subtitle'), max_length=200, blank=True, null=True)
    description = models.TextField(_('description'), blank=True, null=True)

    tags = TaggableManager(blank=True, through=TaggedObject)

    # madek uuid
    remote_uuid = models.CharField(_('remote_uuid'), max_length=200, blank=True, null=True)
    remote_href = models.CharField(_('remote_href'), max_length=200, blank=True, null=True)

    # word document id for annotaions
    doc_id = models.IntegerField(unique=True, null=True, blank=True)

    class Meta:
        app_label = 'museum'
        verbose_name = _('collection')
        verbose_name_plural = _('collections')
        db_table = 'museum_collection'
        ordering = ('title',)

    def __unicode__(self):
        return u'%s' % (self.title)


    def get_absolute_url(self):
        return 'sets/%s' % self.slug




