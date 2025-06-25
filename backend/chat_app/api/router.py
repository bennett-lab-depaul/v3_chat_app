from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import (
    GoalView, UserSettingsView,              # One-off endpoints
    ProfileView, SignupView,                 # Auth / Profile
    MyTokenObtainPairView,                   # JWT login
    ChatSessionViewSet, ReminderViewSet,     # Collection endpoints
)

# ------------------------------------------------------------------
# ViewSets go in a DRF router
# ------------------------------------------------------------------
router = DefaultRouter()
router.register(r"chatsessions", ChatSessionViewSet, basename="chatsession")
router.register(r"reminders",    ReminderViewSet,    basename="reminder"   )

# ------------------------------------------------------------------
# Single-object endpoints (no list) & auth go into urlpatterns
# ------------------------------------------------------------------
urlpatterns = [
    # /api/chatsessions/
    path("", include(router.urls)),

    # Single-row resources (one per user)
    path("goal/",             GoalView.as_view(), name="goal"    ),
    path("settings/", UserSettingsView.as_view(), name="settings"),

    # Profile & signup
    path("profile/", ProfileView.as_view(), name="profile"),
    path("signup/",   SignupView.as_view(), name="signup" ),

    # JWT login
    path("token/",         MyTokenObtainPairView.as_view(),                   name="token"        ),
    path("token/refresh/", "rest_framework_simplejwt.views.TokenRefreshView", name="token_refresh"),
]
