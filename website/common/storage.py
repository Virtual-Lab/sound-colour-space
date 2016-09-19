from django.core.files.storage import get_storage_class


class DataStorage(get_storage_class()):

    def _save(self, name, content):
        self.delete(name)
        return super(DataStorage, self)._save(name, content)

    def get_available_name(self, name):
        return name
