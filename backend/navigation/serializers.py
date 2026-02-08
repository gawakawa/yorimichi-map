from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="ユーザーのメッセージ")
    history = ChatMessageSerializer(many=True, required=False, default=[])


class CoordsSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class PlaceSerializer(serializers.Serializer):
    name = serializers.CharField()
    address = serializers.CharField()
    rating = serializers.FloatField()
    coords = CoordsSerializer()
    price_level = serializers.CharField()


class TollSerializer(serializers.Serializer):
    currencyCode = serializers.CharField()  # noqa: N815
    units = serializers.CharField()


class RouteSerializer(serializers.Serializer):
    origin = serializers.CharField()
    destination = serializers.CharField()
    waypoints = serializers.ListField(child=serializers.CharField())
    duration_seconds = serializers.CharField()
    distance_meters = serializers.IntegerField()
    encoded_polyline = serializers.CharField()
    tolls = TollSerializer(many=True, required=False, default=[])
    google_maps_url = serializers.CharField()


class ChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()
    route = RouteSerializer(required=False, allow_null=True)
    places = PlaceSerializer(many=True, required=False, allow_null=True)


class ReturnRouteRequestSerializer(serializers.Serializer):
    origin = serializers.CharField()
    destination = serializers.CharField()
    waypoints = serializers.ListField(child=serializers.CharField())


class ReturnRouteResponseSerializer(serializers.Serializer):
    route = RouteSerializer()
