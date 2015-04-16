"use strict";
module.exports = function(sequelize, DataTypes) {
  var Song = sequelize.define("Song", {
    song_title: DataTypes.STRING,
    album_title: DataTypes.STRING,
    artist_name: DataTypes.STRING,
    album_id: DataTypes.STRING,
    copyright: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Song;
};