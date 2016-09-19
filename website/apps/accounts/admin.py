from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.utils.translation import ugettext_lazy as _

from accounts.forms import EmailUserChangeForm, EmailUserCreationForm
from accounts.models import MyUser


class MyUserAdmin(UserAdmin):
    form = EmailUserChangeForm
    add_form = EmailUserCreationForm

    fieldsets = (
        (None, {'fields': ('email', 'name', 'slug', 'password')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'user_permissions')}), # , 'groups'
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = ((
        None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2')
        }
    ),
    )
    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('email', 'name', 'slug', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active') # , 'groups'
    search_fields = ('email', 'name', 'slug')
    ordering = ('email', 'name')
    filter_horizontal = ('user_permissions',) # 'groups',


admin.site.register(MyUser, MyUserAdmin)
admin.site.unregister(Group)



