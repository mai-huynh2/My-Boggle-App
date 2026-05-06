import uuid

from django.core.validators import MinValueValidator
from django.db import models


class Game(models.Model):
    """
    Represents a single Boggle game instance
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=200)
    size = models.PositiveIntegerField(validators=[MinValueValidator(2)])

    grid = models.JSONField()

    dictionary_language = models.CharField(
        max_length=20,
        choices=[
            ("english", "English"),
            ("spanish", "Spanish"),
        ],
        default="english",
    )

    solution_words = models.JSONField(default=list, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.size}x{self.size})"


class LeaderBoard(models.Model):
    """
    One leaderboard per game
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    game = models.OneToOneField(
        Game,
        on_delete=models.CASCADE,
        related_name="leaderboard",
    )

    title = models.CharField(max_length=200, blank=True, default="")

    def __str__(self):
        return self.title if self.title else f"Leaderboard for {self.game.name}"


class LeaderBoardEntry(models.Model):
    """
    Stores a player's result for a game
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    leaderboard = models.ForeignKey(
        LeaderBoard,
        on_delete=models.CASCADE,
        related_name="entries",
    )

    player_name = models.CharField(max_length=100)

    words_found_count = models.PositiveIntegerField(default=0)
    total_time_seconds = models.PositiveIntegerField(default=0)

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["total_time_seconds", "-words_found_count", "-saved_at"]

    def __str__(self):
        return (
            f"{self.player_name} - "
            f"{self.words_found_count} words in "
            f"{self.total_time_seconds}s"
        )