"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
  	migration.addColumn(
  'Users',
  'song_id',
  DataTypes.STRING
)
    // add altering commands here, calling 'done' when finished
    done();
  },

  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done();
  }
};
