var Evernote = require('evernote').Evernote;
var config = require('./config.json');
var userConfig = require('./userConfig.json');
const opn = require('opn');
process.env.NODE_CONFIG_DIR = "./";
const configHelper = require('config');


var openRandomNote = function (userData) {
    var token = userData.oauthAccessToken;
    var shard = userData.edamShard;
    var userId = userData.edamUserId;
    var client = new Evernote.Client({
        token: token,
        sandbox: config.SANDBOX,
        china: config.CHINA
    });

    client.getNoteStore().listNotebooks(function (err, notebooks) {
        if (err) {
            console.log(err);
            throw err;
        }

        if (configHelper.has("stacks")) {
            userConfig.stacks = configHelper.get("stacks");
        }
        var notebooksFromConfiguredStacks = notebooks.filter(function (notebook) {
            for (var i = 0; i < userConfig.stacks.length; ++i) {
                if (notebook.stack === userConfig.stacks[i]) {
                    return true;
                }
            }
            return false;
        });

        client.getNoteStore().findNoteCounts(new Evernote.NoteFilter({}), false, function (err, noteCollectionCounts) {
            if (err) {
                console.log(err);
                throw err;
            }
            var totalNoteCount = 0;
            var nonEmptyNotebooks = notebooksFromConfiguredStacks.filter(function (notebook) {
                var notebookCount = noteCollectionCounts.notebookCounts[notebook.guid];
                if (notebookCount && notebookCount > 0) {
                    notebook.noteCount = notebookCount;
                    totalNoteCount += notebookCount;
                    return true;
                }
                return false;
            });
            
            var randomNoteIndex = getRandomInt(0, totalNoteCount);
            
            var correctNotebook = null;
            var noteCounterToFindCorrectNotebook = 0;
            for (var i = 0; i < nonEmptyNotebooks.length; ++i) {
                noteCounterToFindCorrectNotebook += nonEmptyNotebooks[i].noteCount;
                if (noteCounterToFindCorrectNotebook >= randomNoteIndex) {
                    correctNotebook = nonEmptyNotebooks[i];
                    break;
                }
            }
            if (correctNotebook == null) {
                var err = "Not able to find a non-empty notebook within those stacks";
                throw err;
            }
            
            var spec = new Evernote.NotesMetadataResultSpec({
                includeTitle: false,
                includeContentLength: false,
                includeCreated: false,
                includeUpdated: false,
                includeDeleted: false,
                includeUpdateSequenceNum: false,
                includeNotebookGuid: false,
                includeTagGuids: false,
                includeAttributes: false,
                includeLargestResourceMime: false,
                includeLargestResourceSize: false,
            });
            var randomNoteWithinCorrectNotebookIndex = getRandomInt(0, noteCounterToFindCorrectNotebook-randomNoteIndex);
            var filter = new Evernote.NoteFilter({
                notebookGuid: correctNotebook.guid
            });
            client.getNoteStore().findNotesMetadata(filter, randomNoteWithinCorrectNotebookIndex, 1, spec, function (err, notesMetaDataList) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                opn("evernote:///view/" + userId + "/" + shard + "/" + notesMetaDataList.notes[0].guid + "/" + notesMetaDataList.notes[0].guid);
            });
        });
    });
}

module.exports = openRandomNote;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}