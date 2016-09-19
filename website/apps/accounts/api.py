import json
from tastypie import fields
from django.conf.urls import *
from django.utils.text import slugify
from django_extensions.db.fields import UUIDField
from django.core.files import File
from django.core.files.base import ContentFile

from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.utils import trailing_slash
from tastypie.http import HttpNoContent, HttpUnauthorized, HttpForbidden
from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import Authorization

from django import forms
from tastypie.validation import Validation, FormValidation

from tastypie.exceptions import Unauthorized, ImmediateHttpResponse
from tastypie.models import ApiKey
from tastypie.http import HttpGone, HttpMultipleChoices


from django.http import HttpResponse, HttpResponseBadRequest, Http404
from django.utils.translation import ugettext as _

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib import messages

from .adapter import USERNAME_REGEX
from django.conf import settings

from allauth.account.models import EmailAddress
from accounts.models import MyUser, UserProfile


class UserAuthorization(Authorization):
    '''UserAuthorization: allows anyone to read and logged in users to update their own user object'''
    def authorize_user(self, bundle):
        #if bundle.request.user.is_superuser:
        #    return True
        if bundle.request.user == bundle.obj:
            return True

        return False

    def read_detail(self, object_list, bundle):
        return True

    def create_detail(self, object_list, bundle):
        return self.authorize_user(bundle)

    def update_detail(self, object_list, bundle):
        return self.authorize_user(bundle)

    def update_list(self, object_list, bundle):
        allowed = []
        for obj in object_list:
            if bundle.request.user == bundle.obj.user: # bundle.request.user.is_superuser or
                allowed.append(obj)

        return allowed

    def delete_detail(self, object_list, bundle):
        return self.authorize_user(bundle)

    def delete_list(self, object_list, bundle):
        allowed = []
        for obj in object_list:
            if bundle.request.user == bundle.obj.user: # bundle.request.user.is_superuser or
                allowed.append(obj)

        return allowed



class UserValidation(Validation):
    def is_valid(self, bundle, request=None):

        if not bundle.data:
            return {'__all__': 'Not quite what I had in mind.'}

        errors = {}

        if bundle.data.has_key('slug'):

            username = bundle.data['slug']

            # check length
            if len(username) < settings.ACCOUNT_USERNAME_MIN_LENGTH:
                errors['slug'] = ['Username must be > ' + str(settings.ACCOUNT_USERNAME_MIN_LENGTH-1) + ' characters long.']

            # check not in blacklist
            username_blacklist_lower = [ub.lower() for ub in settings.ACCOUNT_USERNAME_BLACKLIST]
            if username.lower() in username_blacklist_lower:
                errors['slug'] = ['Username can not be used. Please use other username.']

            # check OK with regex
            if not USERNAME_REGEX.match(username):
                errors['slug'] = ['Usernames can only contain lowercase letters, digits and _.']

            # check if not already taken
            user_model = get_user_model()
            try:
                user_model.objects.get(slug=username)
                errors['slug'] = ['This username is already taken. Please choose another.']
            except user_model.DoesNotExist:
                pass

        if len(errors) == 0:
            messages.add_message(bundle.request, messages.SUCCESS, 'Account updated.', fail_silently=True)

        return errors

class UserResource(ModelResource):

    profile = fields.OneToOneField('accounts.api.UserProfileResource', 'profile', related_name='user', null=True, full=True,)

    class Meta:
        queryset = get_user_model().objects.all()
        resource_name = 'user'
        detail_uri_name = 'slug'
        always_return_data = True

        list_allowed_methods = ["get"]
        detail_allowed_methods = ["get", "patch", "post"]

        authentication = Authentication()
        authorization = UserAuthorization()

        fields = ['name', 'slug']
        excludes = ['id', ]

        validation = UserValidation()

        ordering = ['slug']

        filtering = {
            'slug': ALL_WITH_RELATIONS,
        }

        ordering = ['slug']

    def prepend_urls(self):
        return [
            url(
                r"^(?P<resource_name>%s)/(?P<slug>[\w\d_.-]+)/$" % self._meta.resource_name,
                self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
            url(
                r"^(?P<resource_name>%s)/login%s$" % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(
                r"^(?P<resource_name>%s)/logout%s$" % (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name="api_logout"),
        ]


    def dehydrate(self, bundle):
        if bundle.obj.pk == bundle.request.user.pk:
            bundle.data['email_addresses'] = [{'email_address':address.email, 'primary':address.primary, 'verified':address.verified} for address in EmailAddress.objects.filter(user=bundle.request.user.pk)]

        return bundle


    def login(self, request, **kwargs):

        self.method_check(request, allowed=['post'])

        username = json.loads(request.body)['username']
        password = json.loads(request.body)['password']

        user = authenticate(username=username, password=password)

        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                    }, HttpForbidden )
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
                }, HttpUnauthorized )


    def logout(self, request, **kwargs):

        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })
        else:
            return self.create_response(request, { 'success': False }, HttpUnauthorized)

    '''
    def hydrate_slug(self, bundle):
        bundle.data['slug'] = bundle.data['slug'].lower()
        messages.add_message(bundle.request, messages.SUCCESS, 'Account updated.', fail_silently=True)
        return bundle
    '''


