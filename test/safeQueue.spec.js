/*
   Copyright 2017 Smart-Tech Controle e Automação

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

const {
    expect
} = require('chai');

const os = require('os');
const fs = require('fs');
const path = require('path');
const FileSystem = require('../src/FileSystem.js');

function getDirBase() {
    var dirBase = path.join(os.tmpdir(), (Math.random() * (9999999 - 1) + 1).toString());
    return dirBase;
}

function destroyerDirBase(fileSystem, pathBase, callback) {

    let dirBase = path.join(pathBase);
    let dirQueue = path.join(pathBase, 'queue');
    let dirError = path.join(pathBase, 'error');
    let dirDone = path.join(pathBase, 'done');

    fileSystem.close();


    fs.stat(dirBase, (err, stats) => {
        if (!err) {
            trataDone((err, proximo) => {
                // console.log("Error trataDone: ", err, " prox: ", proximo);
                if (proximo) {
                    //proximo
                    trataError((err, proximo) => {
                        // console.log("Error trataError: ", err, " prox: ", proximo);
                        if (proximo) {
                            //proximo
                            trataQueue((err, proximo) => {
                                // console.log("Error trataQueue: ", err, " prox: ", proximo);
                                if (proximo) {
                                    //proximo
                                    fs.rmdir(dirBase, (err) => {
                                        callback(err);
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(null);
        }
    });

    function trataDone(callback) {

        var proximo = null;

        fs.stat(dirDone, (err, stats) => {
            // console.log("func trataDone1: ", err, " prox: ", proximo);
            if (!err) {
                //deleta files
                fileSystem.deleteDone(0, (err) => {
                    // console.log("func trataDone2: ", err, " prox: ", proximo);
                    if (!err) {
                        //deleta dir
                        fs.rmdir(dirDone, (err) => {
                            // console.log("func trataDone3: ", err, " prox: ", proximo);
                            if (!err) {
                                //proximo
                                proximo = true;
                                callback(err, proximo);
                            } else {
                                //Falha
                                proximo = false;
                                callback(err, proximo);
                            }
                        });
                    } else {
                        //Falha
                        proximo = false;
                        callback(err, proximo);
                    }
                });
            } else {
                //Proximo
                proximo = true;
                callback(err, proximo);
            }
        });
    }

    function trataError(callback) {

        var proximo = null;

        fs.stat(dirError, (err, stats) => {
            // console.log("func trataError1: ", err, " prox: ", proximo);
            if (!err) {
                //deleta files
                fileSystem.deleteError(0, (err) => {
                    // console.log("func trataError2: ", err, " prox: ", proximo);
                    if (!err) {
                        //deleta dir
                        fs.rmdir(dirError, (err) => {
                            // console.log("func trataError3: ", err, " prox: ", proximo);
                            if (!err) {
                                //proximo
                                proximo = true;
                                callback(err, proximo);
                            } else {
                                //Falha
                                proximo = false;
                                callback(err, proximo);
                            }
                        });
                    } else {
                        //Falha
                        proximo = false;
                        callback(err, proximo);
                    }
                });
            } else {
                //Proximo
                proximo = true;
                callback(err, proximo);
            }
        });
    }

    function trataQueue(callback) {

        var proximo = null;

        fs.stat(dirQueue, (err, stats) => {
            // console.log("func trataQueue1: ", err, " prox: ", proximo);
            if (!err) {
                //deleta files
                fileSystem.deleteQueue((err) => {
                    // console.log("func trataQueue2: ", err, " prox: ", proximo);
                    if (!err) {
                        //deleta dir
                        fs.rmdir(dirQueue, (err) => {
                            // console.log("func trataQueue3: ", err, " prox: ", proximo);
                            if (!err) {
                                //proximo
                                proximo = true;
                                callback(err, proximo);
                            } else {
                                //Falha
                                proximo = false;
                                callback(err, proximo);
                            }
                        });
                    } else {
                        //Falha
                        proximo = false;
                        callback(err, proximo);
                    }
                });
            } else {
                //Proximo
                proximo = true;
                callback(err, proximo);
            }
        });
    }


}

describe('#SafeQueue', () => {

    //--> Diretorios
    it('#Diretorios', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');
        let dirError = path.join(pathBase, 'error');
        let dirDone = path.join(pathBase, 'done');

        fileSystem.init((err) => {
            // console.log("Init: ", err);
            fs.stat(dirQueue, (err, stat) => {
                // console.log("Queue: ", err);
                if (!err) {
                    if (stat.isDirectory()) {
                        fs.stat(dirDone, (err, stat) => {
                            // console.log("Done: ", err);
                            if (!err) {
                                if (stat.isDirectory()) {
                                    fs.stat(dirError, (err, stat) => {
                                        // console.log("Error: ", err);
                                        if (!err) {
                                            if (stat.isDirectory()) {
                                                destroyerDirBase(fileSystem, pathBase, (err) => {
                                                    // console.log("Error: ", err);
                                                    if (!err) {
                                                        done();
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        });
    });
    //--> Diretorios

    //--> Salvar Arquivos
    it('#Salvar arquivo e verificar integridade', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;

        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};

        fileSystem.init((err) => {
            // console.log("Init Error: ", err);
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    // console.log("Save Error: ", err);
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            // console.log("Save Error: ", err);
                            if (!err) {
                                fileSystem.getMessage(teste.obj1._msgid, (err, data) => {
                                    // console.log("Get Error: ", err);

                                    if (!err) {

                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });

                                        fileSystem.getMessage(teste.obj2._msgid, (err, data) => {

                                            // console.log("Get Error: ", err);

                                            expect(data).to.be.deep.equal({
                                                'keyMessage': "654321",
                                                '_msgid': "654321",
                                                'payload': "File Data2"
                                            });

                                            if (!err) {
                                                fileSystem.getQueueSize((err, res) => {
                                                    // console.log("Get size Error: ", err);
                                                    if (!err) {
                                                        expect(2).to.equal(res);
                                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                                            // console.log("Destroyer Error: ", err);
                                                            if (!err) {
                                                                done();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Excluir pasta queue, salvar arquivo e verificar integridade', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');

        var teste = this;

        teste.obj = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fs.rmdir(dirQueue, (err) => {
                    // console.log("rmdir dirQueue - Err: ", err);
                    if (!err) {
                        fileSystem.saveMessage(teste.obj, (err, res) => {
                            // console.log("saveMessage - Err: ", err);
                            if (!err) {
                                fileSystem.getMessage(teste.obj._msgid, (err, data) => {
                                    if (!err) {
                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });
                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                            if (!err) {
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Excluir pasta base, salvar arquivo e verificar integridade', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');

        var teste = this;

        teste.obj = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            // console.log("File System Err: ", err);
            if (!err) {
                destroyerDirBase(fileSystem, pathBase, (err) => {
                    // console.log("Destroyer Err: ", err);
                    if (!err) {
                        fileSystem.saveMessage(teste.obj, (err, res) => {
                            // console.log("Save Message Err: ", err);
                            if (!err) {
                                fileSystem.getMessage(teste.obj._msgid, (err, data) => {
                                    // console.log("Get Message Err: ", err);
                                    if (!err) {
                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });
                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                            // console.log("Final Destroyer Err: ", err);
                                            if (!err) {
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    /*it('#Salvar dois arquivos com mesmo nome', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var obj = {};
        obj._msgid = "123456";
        obj.payload = "File Data";

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(obj, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(obj, (err, res) => {
                            //console.log("Duplicado: ", err);
                            if (!err) {
                                expect(obj.payload).to.equal(data);
                                destroyerDirBase(fileSystem, pathBase, (err) => {
                                    if (!err) {
                                        done();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }); */
    //--> Salvar Arquivos


    //--> Movimentação de Arquivos
    it('#Mover arquivo para error', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;

        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};


        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.errorMessage(teste.obj1.keyMessage, (err) => {
                                    if (!err) {
                                        fileSystem.getErrorSize((err, res) => {
                                            if (!err) {
                                                expect(1).to.equal(res);

                                                fileSystem.errorMessage(teste.obj2.keyMessage, (err) => {
                                                    if (!err) {

                                                        fileSystem.getErrorSize((err, res) => {
                                                            if (!err) {

                                                                expect(2).to.equal(res);

                                                                destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                    if (!err) {
                                                                        done();
                                                                    }
                                                                });

                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Mover arquivo para done', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;

        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};


        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.doneMessage(teste.obj1._msgid, (err, res) => {
                                    if (!err) {
                                        fileSystem.doneMessage(teste.obj2._msgid, (err, res) => {
                                            if (!err) {
                                                fileSystem.getDoneSize((err, res) => {
                                                    if (!err) {
                                                        expect(2).to.equal(res);
                                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                                            if (!err) {
                                                                done();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Excluir pasta error e mover arquivo para error', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirError = path.join(pathBase, 'error');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fs.rmdir(dirError, (err) => {
                            if (!err) {
                                fileSystem.errorMessage(teste.obj1._msgid, (err, res) => {
                                    if (!err) {
                                        fileSystem.getErrorSize((err, res) => {
                                            if (!err) {
                                                expect(1).to.equal(res);
                                                destroyerDirBase(fileSystem, pathBase, (err) => {
                                                    if (!err) {
                                                        done();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Excluir pasta done e mover arquivo para done', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirDone = path.join(pathBase, 'done');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fs.rmdir(dirDone, (err) => {
                            if (!err) {
                                fileSystem.doneMessage(teste.obj1._msgid, (err, res) => {
                                    if (!err) {
                                        fileSystem.getDoneSize((err, res) => {
                                            if (!err) {
                                                expect(1).to.equal(res);
                                                destroyerDirBase(fileSystem, pathBase, (err) => {
                                                    if (!err) {
                                                        done();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    //--> Movimentação de Arquivos


    //-->Delete Arquivos
    it('#Salvar e excluir arquvos da pasta queue', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.getQueueSize((err, res) => {
                                    if (!err) {
                                        expect(2).to.equal(res);
                                        fileSystem.deleteQueue((err, res) => {
                                            if ("err") {
                                                fileSystem.getQueueSize((err, res) => {
                                                    if (!err) {
                                                        expect(0).to.equal(res);
                                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                                            if (!err) {
                                                                done();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Mover e excluir arquivos da pasta error', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;

        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.errorMessage(teste.obj1._msgid, (err, res) => {
                                    if (!err) {
                                        fileSystem.errorMessage(teste.obj2._msgid, (err, res) => {
                                            fileSystem.getErrorSize((err, res) => {
                                                if (!err) {
                                                    expect(2).to.equal(res);
                                                    fileSystem.deleteError(null, (err, res) => {
                                                        if (!err) {
                                                            fileSystem.getErrorSize((err, res) => {
                                                                if (!err) {
                                                                    expect(0).to.equal(res);
                                                                    destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                        if (!err) {
                                                                            done();
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Mover e excliur arquivos da pasta done', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};


        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.doneMessage(teste.obj1._msgid, (err, res) => {
                                    if (!err) {
                                        fileSystem.doneMessage(teste.obj2._msgid, (err, res) => {
                                            if (!err) {
                                                fileSystem.getDoneSize((err, res) => {
                                                    if (!err) {
                                                        expect(2).to.equal(res);
                                                        fileSystem.deleteDone(null, (err, res) => {
                                                            if (!err) {
                                                                fileSystem.getDoneSize((err, res) => {
                                                                    if (!err) {
                                                                        expect(0).to.equal(res);
                                                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                            if (!err) {
                                                                                done();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    //-->Delete Arquivos


    //-->Get Files
    it('#Buscar lista de arquivos', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};
        teste.obj3 = {'keyMessage': "987654", '_msgid': "987654", 'payload': "File Data3"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.saveMessage(teste.obj3, (err, res) => {
                                    if (!err) {
                                        fileSystem.getMessageList((err, res) => {

                                            var compare = [teste.obj1._msgid, teste.obj2._msgid, teste.obj3._msgid];

                                            expect(compare).to.deep.equal(res);
                                            destroyerDirBase(fileSystem, pathBase, (err) => {
                                                if (!err) {
                                                    done();
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Reenviar arquivos que estão na pasta error', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};
        teste.obj2 = {'keyMessage': "654321", '_msgid': "654321", 'payload': "File Data2"};
        teste.obj3 = {'keyMessage': "987654", '_msgid': "987654", 'payload': "File Data3"};

        fileSystem.init((err) => {
            if (!err) {
                fileSystem.saveMessage(teste.obj1, (err, res) => {
                    if (!err) {
                        fileSystem.saveMessage(teste.obj2, (err, res) => {
                            if (!err) {
                                fileSystem.saveMessage(teste.obj3, (err, res) => {
                                    if (!err) {
                                        fileSystem.errorMessage(teste.obj1._msgid, (err, res) => {
                                            if (!err) {
                                                fileSystem.errorMessage(teste.obj2._msgid, (err, res) => {
                                                    if (!err) {
                                                        fileSystem.errorMessage(teste.obj3._msgid, (err, res) => {
                                                            if (!err) {
                                                                fileSystem.getErrorSize((err, res) => {
                                                                    if (!err) {
                                                                        expect(3).to.equal(res);
                                                                        fileSystem.resendErrors(0, (err, res) => {
                                                                            if (!err) {
                                                                                fileSystem.getQueueSize((err, res) => {
                                                                                    if (!err) {
                                                                                        expect(3).to.equal(res);
                                                                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                                            if (!err) {
                                                                                                done();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    //-->Get Files


    //-->Ações externas
    it('#Adição externa de arquivo .json e verificar integridade', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');
        let dirFile = path.join(dirQueue, 'file.json');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fs.writeFile(dirFile, JSON.stringify(teste.obj1), (err) => {
                    if (!err) {
                        fileSystem.getQueueSize((err, res) => {
                            if (!err) {
                                expect(1).to.equal(res);
                                fileSystem.getMessage('file', (err, data) => {
                                    if (!err) {
                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });
                                        fileSystem.getMessageList((err, res) => {

                                            var compare = ['file'];
                                            expect(compare).to.deep.equal(res);
                                            destroyerDirBase(fileSystem, pathBase, (err) => {
                                                if (!err) {
                                                    done();
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Adição externa de arquivo .txt', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');
        let dirFile = path.join(dirQueue, 'file.txt');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fs.writeFile(dirFile, JSON.stringify(teste.obj1), (err) => {
                    if (!err) {
                        fileSystem.getMessageList((err, res) => {
                            if (!err) {
                                var compare = [];
                                expect(compare).to.deep.equal(res);
                                fileSystem.getErrorSize((err, res) => {
                                    if (!err) {
                                        expect(0).to.equal(res);
                                        destroyerDirBase(fileSystem, pathBase, (err) => {
                                            if (!err) {
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Adição externa de arquivo .json e mover para error', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');
        let dirFile = path.join(dirQueue, 'file.json');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fs.writeFile(dirFile, JSON.stringify(teste.obj1), (err) => {
                    if (!err) {
                        fileSystem.getQueueSize((err, res) => {
                            if (!err) {
                                expect(1).to.equal(res);
                                fileSystem.getMessage('file', (err, data) => {
                                    if (!err) {
                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });
                                        fileSystem.getMessageList((err, res) => {

                                            var compare = ['file'];
                                            expect(compare).to.deep.equal(res);

                                            fileSystem.errorMessage('file', (err) => {
                                                if (!err) {
                                                    fileSystem.getErrorSize((err, res) => {
                                                        if (!err) {
                                                            expect(1).to.equal(res);
                                                            destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                if (!err) {
                                                                    done();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    it('#Adição externa de arquivo .json e mover para done', (done) => {
        let pathBase = getDirBase();
        let fileSystem = new FileSystem({'path': pathBase});
        let dirQueue = path.join(pathBase, 'queue');
        let dirFile = path.join(dirQueue, 'file.json');

        var teste = this;
        teste.obj1 = {'keyMessage': "123456", '_msgid': "123456", 'payload': "File Data1"};

        fileSystem.init((err) => {
            if (!err) {
                fs.writeFile(dirFile, JSON.stringify(teste.obj1), (err) => {
                    if (!err) {
                        fileSystem.getQueueSize((err, res) => {
                            if (!err) {
                                expect(1).to.equal(res);
                                fileSystem.getMessage('file', (err, data) => {
                                    if (!err) {
                                        expect(data).to.be.deep.equal({
                                            'keyMessage': "123456",
                                            '_msgid': "123456",
                                            'payload': "File Data1"
                                        });
                                        fileSystem.getMessageList((err, res) => {

                                            var compare = ['file'];
                                            expect(compare).to.deep.equal(res);

                                            fileSystem.doneMessage('file', (err) => {
                                                if (!err) {
                                                    fileSystem.getDoneSize((err, res) => {
                                                        if (!err) {
                                                            expect(1).to.equal(res);
                                                            destroyerDirBase(fileSystem, pathBase, (err) => {
                                                                if (!err) {
                                                                    done();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    //-->Ações externas

});