# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from admin_tools.dashboard import modules, Dashboard, AppIndexDashboard
from admin_tools.utils import get_admin_site_name

'''
class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard for website.
    """
    columns = 2

    def init_with_context(self, context):
        site_name = get_admin_site_name(context)

        request = context['request']

        self.children.append(modules.LinkList(
            _('Quick links'),
            layout='inline',
            draggable=False,
            deletable=False,
            collapsible=False,
            #children=children,
            children=[
                {
                    'title': _('CMS Seiten'),
                    'url': '/admin/cms/page/',
                    'external': False,
                    'icon': 'cms-pages',
                    'disabled': not request.user.has_perm('blog.change_article'),
                },
                {
                    'title': _('News Ticker'),
                    'url': '/admin/ticker/entry/',
                    'icon': 'news-entries',
                    'disabled': not request.user.has_perm('ticker.change_entry'),
                },
                {
                    'title': _('"Lesen" App'),
                    'url': '/admin/blog/article/',
                    'icon': 'articles',
                    'disabled': not request.user.has_perm('blog.change_article'),
                },
                {
                    'title': _('"Hören" App'),
                    'url': '/admin/music/playlist/',
                    'icon': 'playlists',
                    'disabled': not request.user.has_perm('music.change_playlist'),
                },
                {
                    'title': _('"Directory" App'),
                    'url': '/admin/atoz/azentry/',
                    'icon': 'articles',
                    'disabled': not request.user.has_perm('atoz.change_azentry'),
                },
                {
                    'title': _('"Recherchieren" App'),
                    'url': '/admin/recommendation/website/',
                    'icon': 'website-links',
                    'disabled': not request.user.has_perm('recommendation.change_website'),
                },
                {
                    'title': _('Klassifizierung'),
                    'url': '/admin/classification/',
                    'icon': 'classification',
                    'disabled': not request.user.has_perm('classification.change_genre'),
                },
                {
                    'title': _('Dateien & Ordner'),
                    'url': '/admin/filer/folder/',
                    'external': False,
                    'icon': 'files-folders',
                    'disabled': not request.user.has_perm('blog.change_article'),
                },

            ],
            show_title=False,
            template='admin_tools/dashboard/modules/quicklist_panel.html',
            css_classes=['quicklinks',],
            pre_content=_('Swiss Music - App Overview')
        ))

        # append a recent actions module
        self.children.append(modules.RecentActions(
            _('Recent Actions'),
            css_classes=['recent-actions'],
            template='admin_tools/dashboard/modules/recent_actions.html',
            limit=5,
            deletable=False,
        ))

        # append another link list module for "support".
        self.children.append(modules.LinkList(
            _('Support & Tickets'),
            layout='inline',
            draggable=False,
            deletable=False,
            collapsible=False,
            show_title=False,
            children=[
                {
                    'title': _('Bug melden'),
                    'url': 'https://lab.hazelfire.com/projects/swissmusic-ch/issues/new',
                    'external': True,
                    'icon': 'report-a-bug',
                },
                {
                    'title': _('Bug melden (E-Mail)'),
                    'url': 'mailto:lab@hazelfire.com?body=%0D%0A%0D%0AProject: swissmusic-ch',
                    'external': True,
                    'icon': 'report-a-bug-mail',
                },
                {
                    'title': _('Dokumentation'),
                    'url': 'https://swissmusic.ch/doc/',
                    'external': True,
                    'icon': 'cms-documentation',
                },
            ],
            template='admin_tools/dashboard/modules/quicklist_panel.html',
            css_classes=['quicklinks', 'support-panel', 'no-postit-header'],
            pre_content=_('Swiss Music - App Overview')
        ))

        # append an app list module for "Applications"
        self.children.append(modules.AppList(
            _('CMS Administration'),
            deletable=False,
            models=('cms.*', 'filer.*', 'cmsplugin_filer_image.*',),
        ))

        # append an app list module for "Applications"
        self.children.append(modules.AppList(
            _('Swiss Music Apps'),
            deletable=False,
            exclude=('django.contrib.*', 'user_extra.*', 'cms.*', 'cmsplugin_filer_image.*', 'dummy.*', 'filer.*',),
        ))

        # append an app list module for "Administration"
        self.children.append(modules.AppList(
            _('Users & Groups'),
            deletable=False,
            models=('django.contrib.*', 'user_extra.*',),
        ))


class CustomAppIndexDashboard(AppIndexDashboard):
    """
    Custom app index dashboard for website.
    """

    # we disable title because its redundant with the model list module
    title = ''

    def __init__(self, *args, **kwargs):
        AppIndexDashboard.__init__(self, *args, **kwargs)

        # append a model list module and a recent actions module
        self.children += [
            modules.ModelList(self.app_title, self.models),
            modules.RecentActions(
                _('Recent Actions'),
                include_list=self.get_app_content_types(),
                limit=5
            )
        ]

    def init_with_context(self, context):
        """
        Use this method if you need to access the request context.
        """
        return super(CustomAppIndexDashboard, self).init_with_context(context)
'''
