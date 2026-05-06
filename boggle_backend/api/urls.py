# urls.py

from django.urls import path
from .views import (
    CreateGameBySizeView,
    GameListView,
    GameDetailView,
    GameLeaderBoardView,
    LeaderBoardEntryDeleteView,
)

urlpatterns = [
    path("game/<int:size>/", CreateGameBySizeView.as_view()),
    path("games/", GameListView.as_view()),
    path("games/<uuid:id>/", GameDetailView.as_view()),
    path("games/<uuid:id>/leaderboard/", GameLeaderBoardView.as_view()),
    path("leaderboard-entry/<uuid:id>/delete/", LeaderBoardEntryDeleteView.as_view()),
]