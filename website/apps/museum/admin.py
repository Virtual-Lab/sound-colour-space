from __future__ import unicode_literals
from django.contrib import admin
from django.core import urlresolvers
from django.utils.html import format_html
#from django.urls import reverse
from django.core import urlresolvers
from museum.models import *


class KeywordAdmin(admin.ModelAdmin):
    list_display = ('name', 'description',)
    readonly_fields = ('name', 'remote_uuid', 'tagged')
    search_fields = ('name',)
    fieldsets = (
        (None, {
            'fields': (
                'name', 'remote_uuid', 'description', 'tagged',
            )
        }),
    )

    def tagged(self,obj):
        html = ''

        for e in Entry.objects.filter(tags__name__in=[obj.name]):
            html += format_html(
                '<a href="{}"><img src="{}" width=100px /></a>&nbsp;',
                urlresolvers.reverse('admin:museum_entry_change', args=(e.id,)),
                e.image.url
            )
        return format_html(html)

    tagged.short_description = 'Tagged entries'

admin.site.register(Keyword, KeywordAdmin)

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'first_name', 'last_name', 'pseudonym', 'date_of_birth', 'date_of_death')
    search_fields = ('first_name', 'last_name', 'pseudonym', 'date_of_birth', 'date_of_death')
    fieldsets = (
        (None, {
            'fields': ('first_name', 'last_name', 'pseudonym', 'date_of_birth', 'date_of_death')
        }),
    )
admin.site.register(Author, AuthorAdmin)


class LicenseAdmin(admin.ModelAdmin):
    list_display = ('label', 'usage', 'url')
    fieldsets = (
        (None, {
            'fields': ('label', 'usage', 'url')
        }),
    )
admin.site.register(License, LicenseAdmin)

'''
class SourceAdmin(admin.ModelAdmin):
    list_display = ('copyright_notice', 'source')
    search_fields = ('copyright_notice', 'source')
    fieldsets = (
        (None, {
            'fields': ('copyright_notice', 'source')
        }),
    )

admin.site.register(Source, SourceAdmin)
'''


class LinkAdmin(admin.ModelAdmin):
    list_display = ('title', 'url',)
    search_fields = ('title', 'url',)
    fieldsets = (
        (None, {
            'fields': ('title', 'url',)
        }),
    )
admin.site.register(Link, LinkAdmin)


class ExperimentAdmin(admin.ModelAdmin):
    list_display = ('title', 'view', 'url',)
    search_fields = ('title', )
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'url', 'cover', 'description')
        }),
    )
    prepopulated_fields = {"slug": ("title",)}

    def view(self, obj):
        if obj.slug is not None:
            return format_html(
                '<a href="/{}">{}</a>',
                obj.get_absolute_url(),
                obj.get_absolute_url()
            )

admin.site.register(Experiment, ExperimentAdmin)



class EntryAdmin(admin.ModelAdmin):
    list_display = (
    'title', 'doc_id', 'subtitle', 'portrayed_object_date', 'date', 'uuid', 'madek', 'show_image', 'tag_list')  # 'show_image', 'link_to_author', 'source'
    list_filter = ('author', 'portrayed_object_date', 'tags', 'license',)
    search_fields = (
    'uuid', 'image', 'title', 'description', 'portrayed_object_date', 'author__first_name', 'author__last_name', 'author__pseudonym')
    readonly_fields = ('show_image', 'uuid', 'created', 'modified', 'title', 'subtitle', 'tags', 'portrayed_object_date', 'source',
                       'copyright_notice', 'author', 'license')

    fieldsets = (
        (None, {
            'fields': (
                'doc_id', 'uuid', 'show_image', 'author', 'portrayed_object_date', 'date', 'date_accuracy',
                'title', 'subtitle', 'description', 'tags', 'source',
                'copyright_notice', 'license', 'related', 'link')
        }),

        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('uploader',)
        }),

    )

    # prepopulated_fields = {'Tetraktys squareslug': ('title',)}

    # change_form_template = 'museum/admin/change_form.html'

    filter_horizontal = [
        'related',
    ]

    def get_queryset(self, request):
        return super(EntryAdmin, self).get_queryset(request).prefetch_related('tags')

    def tag_list(self, obj):
        return u", ".join(o.name for o in obj.tags.all())

    def madek(self, obj):
        if obj.remote_uuid is not None:
            return format_html(
                '<a href="http://medienarchiv.zhdk.ch/entries/{}">{}</a>',
                obj.remote_uuid,
                obj.remote_uuid
            )

    madek.short_description = 'MAdeK'

    def show_image(self, obj):
        if obj.image:
            return format_html(
                '<img src={} width=100px />',
                obj.image.url
            )
        else:
            return ''

    show_image.short_description = 'Image'

    '''
    def link_to_author(self, obj):
        if obj.author is not None:
            url = urlresolvers.reverse("admin:museum_author_change", args=[obj.author.id])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.author.get_full_name()
            )
    link_to_author.short_description = 'Author'
    '''

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'uploader':
            kwargs['initial'] = request.user.id
        return super(EntryAdmin, self).formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(Entry, EntryAdmin)



class CollectionAdmin(admin.ModelAdmin):

    list_display = ('title', 'view', 'madek', 'doc_id')
    search_fields = ('title', )
    readonly_fields = ('uuid', 'madek', 'doc_id', 'created', 'modified', 'title', 'slug', 'subtitle', 'author', 'show_image')

    fieldsets = (
        (None, {
            'fields': (
                 'uuid', 'madek', 'doc_id', 'title', 'slug', 'subtitle', 'description', 'author', 'show_image', 'tags',
            )
        }),
    )

    def view(self, obj):
        if obj.slug is not None:
            return format_html(
                '<a href="/{}">{}</a>',
                obj.get_absolute_url(),
                obj.get_absolute_url()
            )

    def show_image(self, obj):
        if obj.entry is not None:
            html = ''
            for e in obj.entry.all():
                html += format_html(
                    '<a href="/{}"><img src="{}" width=100px /></a>&nbsp;',
                    e.get_absolute_url(),
                    e.image.url
                )
            return format_html(html)
        else:
            return ''

    show_image.short_description = 'Diagrams'

    def madek(self, obj):
        if obj.remote_uuid is not None:
            return format_html(
                '<a href="http://medienarchiv.zhdk.ch/sets/{}">{}</a>',
                obj.remote_uuid,
                obj.remote_uuid
            )

    madek.short_description = 'MAdeK'

admin.site.register(Collection, CollectionAdmin)