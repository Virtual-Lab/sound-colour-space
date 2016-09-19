from __future__ import unicode_literals

import re
import warnings
import json

from django.http import HttpResponse
from django.template.loader import render_to_string
from django.template import TemplateDoesNotExist
from django.core.mail import EmailMultiAlternatives, EmailMessage
from django.utils.translation import ugettext_lazy as _
from django import forms
from django.contrib import messages
from django.contrib.auth import get_user_model

try:
    from django.utils.encoding import force_text
except ImportError:
    from django.utils.encoding import force_unicode as force_text



from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter

USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]+$', re.UNICODE)

class MyUserAccountAdapter(DefaultAccountAdapter):

    '''
    def get_login_redirect_url(self, request):
        path = "/{username}"
        return path.format(username=request.user.slug)
    '''

    def clean_username(self, username):
        """
        Validates the username. You can hook into this if you want to
        (dynamically) restrict what usernames can be chosen.
        """
        if not USERNAME_REGEX.match(username):
            raise forms.ValidationError(_("Usernames can only contain "
                                          "letters, digits and _."))

        # TODO: Add regexp support to USERNAME_BLACKLIST
        username_blacklist_lower = [ub.lower()
                                    for ub in settings.ACCOUNT_USERNAME_BLACKLIST]
        if username.lower() in username_blacklist_lower:
            raise forms.ValidationError(_("Username can not be used. "
                                          "Please use other username."))
        username_field = settings.ACCOUNT_USER_MODEL_USERNAME_FIELD
        assert username_field
        user_model = get_user_model()
        try:
            query = {username_field + '__iexact': username}
            user_model.objects.get(**query)
        except user_model.DoesNotExist:
            return username
        raise forms.ValidationError(_("This username is already taken. Please "
                                      "choose another."))