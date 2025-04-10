# signals.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_new_user(instance, **kwargs):
    channel_layer = get_channel_layer()  # Get the channel layer

    if channel_layer:  # Check if the channel layer is not None
        async_to_sync(channel_layer.group_send)(
            'your_group_name',  # Replace with your actual group name
            {
                'type': 'user_notification',
                'message': f'New user registered: {instance.username}',
            }
        )
    else:
        print("Channel layer is not set up correctly.")
