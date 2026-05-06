class GameSerializer(serializers.ModelSerializer):
    leaderboard = LeaderBoardSerializer(read_only=True)

    class Meta:
        model = Game
        fields = (
            "id",
            "name",
            "size",
            "grid",
            "dictionary_language",
            "solution_words",
            "date_created",
            "leaderboard",
        )
        read_only_fields = (
            "id",
            "name",
            "grid",
            "dictionary_language",
            "solution_words",
            "date_created",
            "leaderboard",
        )