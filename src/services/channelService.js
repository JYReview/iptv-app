import channelData from "../json/channels.json";
import sourcesData from "../json/checker_sources.json";

export function fetchCheckerSources() {
  return Promise.resolve(sourcesData);
}

export function fetchChannels() {
  return Promise.resolve(channelData);
}

export function getChannelById(channelId) {
  return channelData.find((channel) => channel.id === channelId) ?? null;
}

export function getChannelMap() {
  return channelData.reduce((map, channel) => {
    map[channel.id] = channel;
    return map;
  }, {});
}
