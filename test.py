
from core import config
from core import spotdl


if __name__ == "__main__":
    config.init_config()

    data = spotdl.search("Loco")

    print(str(data))