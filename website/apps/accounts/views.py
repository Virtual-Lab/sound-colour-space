from django.views.generic import DetailView, ListView, TemplateView
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from allauth.account.views import PasswordChangeView
from allauth.account.adapter import get_adapter
from allauth.account import signals


class UserProfileSettingsView(TemplateView):
    template_name = "accounts/user_profile_settings.html"

class UserProfileAccountView(TemplateView):
    template_name = "accounts/user_profile_account.html"

class UserProfileBillingView(TemplateView):
    template_name = "accounts/user_profile_billing.html"


class UserProfileListView(ListView):
    model = get_user_model()
    template_name = "accounts/user_profile_list.html"


class UserProfileDetailView(DetailView):
    model = get_user_model()
    template_name = "accounts/user_profile_detail.html"


class MyPasswordChangeView(PasswordChangeView):
    """
    Custom class to override the password change view
    """
    success_url = "/"

    # Override form valid view to keep user logged in
    def form_valid(self, form):

        form.save()

        # Update session to keep user logged in.
        update_session_auth_hash(self.request, form.user)

        get_adapter().add_message(self.request,
                                            messages.SUCCESS,
                                            'account/messages/password_changed.txt')

        signals.password_changed.send(sender=self.request.user.__class__,
                                            request=self.request,
                                            user=self.request.user)

        return super(PasswordChangeView, self).form_valid(form)


password_change = login_required(MyPasswordChangeView.as_view())


