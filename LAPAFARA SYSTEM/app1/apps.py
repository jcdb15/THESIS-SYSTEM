from django.apps import AppConfig

class ApplConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'app1'  # Should match the actual directory name

    def ready(self):
        import app1.signals
