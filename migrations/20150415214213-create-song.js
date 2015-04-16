"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Songs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      song_title: {
        type: DataTypes.STRING
      },
      album_title: {
        type: DataTypes.STRING
      },
      artist_name: {
        type: DataTypes.STRING
      },
      album_id: {
        type: DataTypes.STRING
      },
      copyright: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Songs").done(done);
  }
};