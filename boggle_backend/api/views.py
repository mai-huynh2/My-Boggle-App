import uuid

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Game, LeaderBoard, LeaderBoardEntry
from .randomGen import random_grid
from .readJSONFile import read_json_to_list
from .boggle_solver import Boggle


def read_txt_to_list(filename):
    words = []

    try:
        with open(filename, "r", encoding="utf-8") as file:
            for line in file:
                word = line.strip().lower()

                if len(word) >= 3:
                    words.append(word)

    except FileNotFoundError:
        return []

    return words


def get_dictionary(language):
    if language == "spanish":
        filename = "boggle_backend/static/data/spanish-10k.txt"
        return read_txt_to_list(filename)

    filename = "boggle_backend/static/data/full-wordlist.json"
    return read_json_to_list(filename)


class CreateGameBySizeView(APIView):
    def get(self, request, size):
        if size < 3 or size > 10:
            return Response(
                {"error": "Size must be between 3 and 10"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        language = request.GET.get("language", "english").lower()

        if language not in ["english", "spanish"]:
            return Response(
                {"error": "Language must be either english or spanish"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        grid = random_grid(size)
        dictionary = get_dictionary(language)

        if not dictionary:
            return Response(
                {"error": f"No dictionary words found for {language}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        boggle_game = Boggle(grid, dictionary)
        solutions = boggle_game.getSolution()

        game = Game.objects.create(
            name=f"Game-{uuid.uuid4()}",
            size=size,
            grid=grid,
            dictionary_language=language,
            solution_words=solutions,
        )

        LeaderBoard.objects.create(
            game=game,
            title=f"Leaderboard for {game.name}",
        )

        return Response(
            {
                "id": game.id,
                "name": game.name,
                "size": game.size,
                "grid": game.grid,
                "dictionary_language": game.dictionary_language,
                "solutions": game.solution_words,
                "date_created": game.date_created,
            },
            status=status.HTTP_200_OK,
        )


class GameListView(APIView):
    def get(self, request):
        games = Game.objects.all().order_by("-date_created")

        data = []
        for game in games:
            data.append(
                {
                    "id": game.id,
                    "name": game.name,
                    "size": game.size,
                    "grid": game.grid,
                    "dictionary_language": game.dictionary_language,
                    "solutions": game.solution_words,
                    "date_created": game.date_created,
                }
            )

        return Response(data, status=status.HTTP_200_OK)


class GameDetailView(APIView):
    def get_object(self, id):
        try:
            return Game.objects.get(id=id)
        except Game.DoesNotExist:
            return None

    def get(self, request, id):
        game = self.get_object(id)

        if game is None:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "id": game.id,
                "name": game.name,
                "size": game.size,
                "grid": game.grid,
                "dictionary_language": game.dictionary_language,
                "solutions": game.solution_words,
                "date_created": game.date_created,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, id):
        game = self.get_object(id)

        if game is None:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        name = request.data.get("name", game.name)

        dictionary_language = request.data.get(
            "dictionary_language",
            game.dictionary_language,
        ).lower()

        grid = request.data.get("grid", game.grid)
        solution_words = request.data.get("solution_words", game.solution_words)

        if dictionary_language not in ["english", "spanish"]:
            return Response(
                {"error": "Language must be either english or spanish"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(grid, list):
            return Response(
                {"error": "Grid must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        game.name = name
        game.dictionary_language = dictionary_language
        game.grid = grid
        game.solution_words = solution_words
        game.save()

        return Response(
            {
                "message": "Game updated successfully",
                "id": game.id,
                "name": game.name,
                "size": game.size,
                "grid": game.grid,
                "dictionary_language": game.dictionary_language,
                "solutions": game.solution_words,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, id):
        game = self.get_object(id)

        if game is None:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        game.delete()

        return Response(
            {"message": "Game deleted successfully"},
            status=status.HTTP_200_OK,
        )


class GameLeaderBoardView(APIView):
    def get(self, request, id):
        try:
            game = Game.objects.get(id=id)
            leaderboard = game.leaderboard

        except Game.DoesNotExist:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except LeaderBoard.DoesNotExist:
            return Response(
                {"error": "Leaderboard not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        entries_data = []

        for entry in leaderboard.entries.all():
            entries_data.append(
                {
                    "entry_id": entry.id,
                    "player_name": entry.player_name,
                    "words_found_count": entry.words_found_count,
                    "total_time_seconds": entry.total_time_seconds,
                    "saved_at": entry.saved_at,
                }
            )

        return Response(
            {
                "leaderboard_id": leaderboard.id,
                "title": leaderboard.title,
                "game_id": game.id,
                "entries": entries_data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, id):
        try:
            game = Game.objects.get(id=id)
            leaderboard = game.leaderboard

        except Game.DoesNotExist:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        except LeaderBoard.DoesNotExist:
            leaderboard = LeaderBoard.objects.create(
                game=game,
                title=f"Leaderboard for {game.name}",
            )

        player_name = request.data.get("player_name") or request.data.get("user_id")
        words_found_count = request.data.get("words_found_count", 0)
        total_time_seconds = request.data.get("total_time_seconds", 0)

        if not player_name:
            return Response(
                {"error": "Player name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        entry = LeaderBoardEntry.objects.create(
            leaderboard=leaderboard,
            player_name=player_name,
            words_found_count=words_found_count,
            total_time_seconds=total_time_seconds,
        )

        return Response(
            {
                "message": "Score saved successfully",
                "entry_id": entry.id,
                "player_name": entry.player_name,
                "words_found_count": entry.words_found_count,
                "total_time_seconds": entry.total_time_seconds,
                "saved_at": entry.saved_at,
            },
            status=status.HTTP_201_CREATED,
        )


class LeaderBoardEntryDeleteView(APIView):
    def delete(self, request, id):
        try:
            entry = LeaderBoardEntry.objects.get(id=id)

        except LeaderBoardEntry.DoesNotExist:
            return Response(
                {"error": "Leaderboard entry not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        entry.delete()

        return Response(
            {"message": "Leaderboard entry deleted successfully"},
            status=status.HTTP_200_OK,
        )