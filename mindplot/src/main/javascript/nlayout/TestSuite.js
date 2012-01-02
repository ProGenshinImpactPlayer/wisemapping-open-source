mindplot.nlayout.TestSuite = new Class({
    Extends: mindplot.nlayout.ChildrenSorterStrategy,
    initialize:function() {
        this.testAligned();
        this.testSymmetry();
        this.testGrid();
        this.testEvents();
        this.testEventsComplex();
        this.testDisconnect();
        this.testRemoveNode();
    },

    testAligned: function() {

        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);
        manager.connectNode(0, 1, 0);
        manager.connectNode(1, 2, 0);
        manager.connectNode(2, 3, 0);
        manager.connectNode(3, 4, 0);

        manager.layout();
        manager.dump();
        manager.plot("testAligned", {w:300,h:200});

        $assert(manager.find(0).getPosition().y == manager.find(1).getPosition().y, "Nodes are not aligned");
        $assert(manager.find(0).getPosition().y == manager.find(2).getPosition().y, "Nodes are not aligned");
        $assert(manager.find(0).getPosition().y == manager.find(3).getPosition().y, "Nodes are not aligned");
        $assert(manager.find(0).getPosition().y == manager.find(4).getPosition().y, "Nodes are not aligned");
    },

    testSymmetry: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);
        manager.addNode(5, size, position);
        manager.addNode(6, size, position);
        manager.addNode(7, size, position);
        manager.addNode(8, size, position);
        manager.addNode(9, size, position);
        manager.addNode(10, size, position);
        manager.addNode(11, size, position);
        manager.addNode(12, size, position);
        manager.connectNode(0, 1, 0);
        manager.connectNode(0, 2, 1);
        manager.connectNode(0, 3, 2);
        manager.connectNode(0, 4, 3);
        manager.connectNode(0, 5, 4);
        manager.connectNode(1, 6, 0);
        manager.connectNode(1, 7, 1);
        manager.connectNode(7, 8, 0);
        manager.connectNode(8, 9, 0);
        manager.connectNode(5, 10, 0);
        manager.connectNode(6, 11, 0);
        manager.connectNode(6, 12, 1);

        manager.layout();
//        manager.dump();
        manager.plot("testSymmetry",{w:400, h:300});

        //TODO(gb): make asserts
    },

    testGrid: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        manager.addNode(1, size, position);
        manager.connectNode(0, 1, 0);
        manager.layout();
        manager.plot("testGrid1");

        manager.addNode(2, size, position);
        manager.connectNode(0, 2, 1);
        manager.layout();
        manager.plot("testGrid2");

        manager.addNode(3, size, position);
        manager.connectNode(0, 3, 2);
        manager.layout();
        manager.plot("testGrid3");

        manager.addNode(4, size, position);
        manager.connectNode(0, 4, 3);
        manager.layout();
        manager.plot("testGrid4");

        manager.addNode(5, size, position);
        manager.addNode(6, size, position);
        manager.addNode(7, size, position);
        manager.connectNode(2, 5, 0);
        manager.connectNode(2, 6, 1);
        manager.connectNode(6, 7, 0);
        manager.layout();
        manager.plot("testGrid5", {w:300, h:300});

        manager.dump();

        //TODO(gb): make asserts
    },

    testEvents: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        // Add 3 nodes...
        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);

        // Now connect one with two....
        manager.connectNode(0, 1, 0);
        manager.connectNode(0, 2, 0);
        manager.connectNode(1, 3, 0);

        // Basic layout repositioning ...
        console.log("-- Updated tree ---");
        var events = [];
        manager.addEvent('change', function(event) {
            console.log("Updated nodes: {id:" + event.getId() + ", order: " + event.getOrder() + ",position: {" + event.getPosition().x + "," + event.getPosition().y + "}");
            events.push(event);
        });
        manager.layout(true);
        manager.dump();
        manager.plot("testEvents1");

        // Ok, if a new node is added, this an event should be fired  ...
        console.log("---- Layout without changes should not affect the tree  ---");
        events.empty();
        manager.layout(true);
        manager.plot("testEvents2");

        $assert(events.length == 0, "Unnecessary tree updated.");
    },

    testEventsComplex: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        // Add 3 nodes...
        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);

        // Now connect one with two....
        manager.connectNode(0, 1, 0);
        manager.connectNode(1, 2, 0);
        manager.connectNode(1, 3, 1);

        var events = [];
        manager.addEvent('change', function(event) {
            console.log("Updated nodes: {id:" + event.getId() + ", order: " + event.getOrder() + ",position: {" + event.getPosition().x + "," + event.getPosition().y + "}");
            events.push(event);
        });

        // Reposition ...
        manager.layout(true);
        manager.dump();
        manager.plot("testEventsComplex1");

        // Add a new node and connect. Only children nodes should be affected.
        console.log("---- Connect a new node  ---");

        events.empty();
        manager.connectNode(1, 4, 2);
        manager.layout(true);
        manager.dump();
        manager.plot("testEventsComplex2");

        // @todo: This seems no to be ok...
        $assert(events.length == 4, "Only 3 nodes should be repositioned.");
    },

    testDisconnect: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        // Prepare a sample graph ...
        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);

        manager.connectNode(0, 1, 0);
        manager.connectNode(1, 2, 0);
        manager.connectNode(1, 3, 1);
        manager.connectNode(3, 4, 0);

        var events = [];
        manager.addEvent('change', function(event) {
            var pos = event.getPosition();
            var posStr = pos ? ",position: {" + pos.x + "," + event.getPosition().y : "";
            console.log("Updated nodes: {id:" + event.getId() + ", order: " + event.getOrder() + posStr + "}");
            events.push(event);
        });

        manager.layout(true);
        manager.dump();
        manager.plot("testDisconnect1", {w:300, h:200});

        // Now, disconnect one node ...
        console.log("--- Disconnect a single node ---");
        events.empty();
        manager.disconnectNode(2);
        manager.layout(true);
        manager.dump();
        manager.plot("testDisconnect2", {w:300, h:200});

        $assert(events.some(
            function(event) {
                return event.getId() == 2;
            }), "Event for disconnected node seems not to be propagated");

        // Great, let's disconnect a not with children.
        console.log("--- Disconnect a node with children ---");
        manager.disconnectNode(3);
        manager.layout(true);
        manager.dump();
        manager.plot("testDisconnect3", {w:300, h:200});

        $assert(events.some(
            function(event) {
                return event.getId() == 2;
            }), "Event for disconnected node seems not to be propagated");
    },

    testRemoveNode: function() {
        var size = {width:25,height:25};
        var position = {x:0,y:0};
        var manager = new mindplot.nlayout.LayoutManager(0, size);

        // Prepare a sample graph ...
        manager.addNode(1, size, position);
        manager.addNode(2, size, position);
        manager.addNode(3, size, position);
        manager.addNode(4, size, position);

        manager.connectNode(0, 1, 0);
        manager.connectNode(1, 2, 0);
        manager.connectNode(1, 3, 1);
        manager.connectNode(3, 4, 0);

        var events = [];
        manager.addEvent('change', function(event) {
            var pos = event.getPosition();
            var posStr = pos ? ",position: {" + pos.x + "," + event.getPosition().y : "";
            console.log("Updated nodes: {id:" + event.getId() + ", order: " + event.getOrder() + posStr + "}");
            events.push(event);
        });
        manager.layout(true);
        manager.dump();
        manager.plot("testRemoveNode1", {w:300, h:200});

        // Test removal of a connected node ...
        console.log("--- Remove node 3  ---");
        manager.removeNode(3);
        manager.layout(true);
        manager.dump();
        manager.plot("testRemoveNode2");
    }


});

