# osu-background-overlay

download the repo under the Code tab
unzip it and put it in the static folder of your gosumemory
then in your OBS add a browser source to http://127.0.0.1:24050/osu-background-overlay/
should work

# config

```const config = {
  showOnlyWhenInMap: true, // the background will ONLY show when you're playing a map if this is true, else it will always show
  opacity: 0.2, // the opacity of the background (0-1, 0 being invisible, 1 being solid)
}```