// Variable to store HTML element references, for greater code clarity.
var ELEM = {};
var searchText = '';
var saveMode = 'add';

// Perform tasks that are dependent on the HTML being rendered (being ready).
$('document').ready(function() {
    // Capture HTML element references.
    getElementReferences();

    // Set event handlers.
    setEventHandlers();

    // Get all items for current user.
    getItems('example@mail.com');

    // Generate items for data available when page is rendered.
    // generateItems();

    $(document).keypress(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            searchText = $('#searchInput').val();
            console.log(searchText);
            searchHandler(searchText, false, showEntireSearchResults);
            clearSearchHandler();
        }
    });
    $('#searchInput').keyup(function() {
        searchText = $('#searchInput').val();
        console.log(searchText);
        searchHandler(searchText, true, showSearchResultsSimple);
    });
});

// Display all items on the mypage user searched.
function showEntireSearchResults(items) {
    // Only proceed if we have data.
    if (items) {
        $('#searchResults').empty();
        console.log(items);
        generateItems(items);
        navbarChangeHandler(items, searchText);
    }
}

// Change the title on the header-2 when user press return key.
function navbarChangeHandler(items, searchText) {
    // The info of search results.
    var listElement = `<li class="nav-item p-2 nav-search-result"><small class="text-dark">${items.length} results for "${searchText}"
    </small></li>`;

    // Clear previous search result(if there is).
    $('.nav-search-result').css('display', 'none');

    // Hide the title on the header-2.
    $('.hide').css('display', 'none');

    // Display the info of search results on the header-2.
    $('#sub-nav-ul').append(listElement);
}

// Display only name of items below the search input user searched.
function showSearchResultsSimple(items) {
    // Only proceed if we have data.
    if (items) {
        $('#searchResults').empty();
        console.log(items);
        items.forEach(function(item) {
            // Only proceed if the data has _id and name properties.
            if (item.hasOwnProperty('name')) {
                var divElement = $('<div class="item">' + item.name + '</div>');
                $(divElement).click(searchItemClicked);
                $('#searchResults').append(divElement);
                $('#searchResults').fadeIn(500);
                $('#searchInput').focusout(e => {
                    $('#searchResults').fadeOut(500);
                });
            }
        });
    }
}


function searchHandler(searchTerm, filter, successCallback) {
    if (searchTerm.length >= 3) {
        $.ajax({
            url: 'http://localhost:3000/items/search',
            method: 'POST',
            data: {
                searchText: searchTerm,
                filter: filter
            },
            success: successCallback
        });
    }
}

function showSearchModal(data) {

    ELEM.modalItemName.html(data[0].name);
    // ELEM.modalItemImg.html(event.target.textContent);
    ELEM.modalItemDesc.html(data[0].description);
    // ELEM.modalItemDesc2.html(event.target.textContent);

    ELEM.itemModal.modal('toggle');
}

// Pop up the item modal user searched.
function searchItemClicked(event) {
    console.log(event);
    searchHandler(event.target.innerHTML, false, showSearchModal);
    clearSearchHandler();
}

function clearSearchHandler() {
    $('#searchInput').val('');
    $('#searchResults').empty();
    $('#searchResults').css('display', 'none');
}

// Capture HTML element references.
function getElementReferences() {
    ELEM.idOfItemBeingEdited = $('#idOfItemBeingEdited');
    ELEM.items = $('#items');
    ELEM.addEditModal = $('#addEditModal');
    ELEM.modalTitle = $('.modal-title');
    ELEM.addEditModalTitle = $('#addEditModalTitle');
    ELEM.itemImg = $('#item-img');
    ELEM.itemName = $('#item-name');
    ELEM.itemDesc = $('#item-desc');
    ELEM.itemBrand = $('#item-brand');
    ELEM.itemCtg = $('#item-ctg');
    ELEM.itemCnd = $('#item-cnd');
    ELEM.addItemBtn = $('#addItemBtn');
    ELEM.saveItemBtn = $('#saveItemBtn');

    // Item modal.
    ELEM.itemModal = $('#itemModal');
    ELEM.modalItemName = $('.modal-item-name');
    ELEM.modalItemImg = $('.modal-item-img');
    ELEM.modalItemDesc = $('.modal-item-desc');
    ELEM.modalItemDesc2 = $('.modal-item-desc2');
}

// Set event handlers.
function setEventHandlers() {
    ELEM.itemImg.change(checkData);
    ELEM.itemName.change(checkData);
    ELEM.itemName.keyup(checkData);
    ELEM.itemDesc.change(checkData);
    ELEM.itemDesc.keyup(checkData);
    ELEM.itemBrand.change(checkData);
    ELEM.itemBrand.keyup(checkData);
    ELEM.itemCtg.change(checkData);
    ELEM.itemCnd.change(checkData);
    ELEM.addItemBtn.click(addItemHandler);
    ELEM.saveItemBtn.click(saveItemHandler);
    // Ensure when the modal appears cursor is in name field.
    ELEM.addEditModal.on('shown.bs.modal', function() {
        ELEM.itemName.trigger('focus');
    });
}

// Handler for button clicked to show the add item modal.
function addItemHandler() {
    saveMode = 'add';

    // Name and description fields should be blank when modal opens in 'add' mode.
    resetValues();

    // Set modal title to reflect we are in 'add' mode.
    ELEM.modalTitle.html('ADD ITEM');

    // Show the modal.
    ELEM.addEditModal.modal('toggle');
}

// Handler to save data from the add/edit modal.
function saveItemHandler() {
    // Temporarily capture data from modal.
    var img = ELEM.itemImg.val();
    var name = ELEM.itemName.val();
    var desc = ELEM.itemDesc.val();
    var brand = ELEM.itemBrand.val();
    var ctg = ELEM.itemCtg.val();
    var cnd = ELEM.itemCnd.val();

    var id = ELEM.idOfItemBeingEdited.val();

    // Save the data to the data store.
    saveItem(img, name, desc, brand, ctg, cnd, id);

    // Close the modal if in edit mode.
    if (ELEM.addEditModalTitle.html() === 'EDIT ITEM') {
        ELEM.addEditModal.modal('toggle');
    }
}

// Disable/enable save button depending on
// whether or not required data has been entered.
function checkData() {
    if (ELEM.itemImg.val() === '' || ELEM.itemName.val() === '' || ELEM.itemDesc.val() === '' || ELEM.itemBrand.val() === '' || ELEM.itemCtg.val() === null || ELEM.itemCnd.val() === null) {
        ELEM.saveItemBtn.prop('disabled', true);
    } else {
        ELEM.saveItemBtn.prop('disabled', false);
    }
}

// Get all items for current user.
function getItems(email) {
    $.ajax({
        method: "GET",
        url: "http://localhost:3000/items/" + email,
        success: function(items) {
            console.log(items);
            generateItems(items);
        }
    });
}

// Save the data to the data store.
function saveItem(iImg, iName, iDesc, iBrand, iCtg, iCnd, id) {
    var method = saveMode === 'add' ? 'POST' : 'PUT';
    var url = 'http://localhost:3000/items';
    var file_data = $('#item-img').prop('files')[0];
    var form_data = new FormData();
    form_data.append('file', file_data);
    if (saveMode === 'edit') {
        url += '/' + id;
    }

    $.ajax({
        method: method,
        url: url,
        dataType: 'text', // what to expect back from the server
        cache: false,
        contentType: false,
        processData: false,
        data: {
             form_data,
             userEmail: 'example@mail.com',
             img: iImg,
             name: iName,
             description: iDesc,
             brand: iBrand,
             ctg: iCtg,
             cnd: iCnd
            },
        success: function() {
            getItems('example@mail.com');
        }
        })
        .done(function( msg ) {
          alert( msg );
        });
}

// Generate items for data available when page is rendered.
function generateItems(items) {
    // First wipe out the items in the UI so we don't add duplicates.
    ELEM.items.empty();

    // Operate on each data item we have.
    items.forEach(function(item) {
        // We create the new item top-level div based on the item id in the data.
        var divElement = $('<div class="item" id="' + item._id + '"></div>');

        // Create a div that will hold the edit and delete icons.
        var toolsContainer = $('<div class="tools-container"></div>');

        // Create the edit and delete icon.
        var removeIcon = '<i class="fa fa-times" aria-hidden="true" id="removeIcon"></i>';
        var editIcon = '<i class="fas fa-pen" data-toggle="modal" data-target="#editItemModal" id="editIcon"></i>';

        // Add the edit and delete icon to the tools container.
        toolsContainer.append(editIcon);
        toolsContainer.append(removeIcon);

        // Create the UI elements for the new item,
        // setting their data from the item data.
        var imgElement = '<img class="itemImg">' + item.img + '</img>';
        var nameElement = '<h4 class="itemName">' + item.name + '</h4>';
        var descElement = '<p class="itemDesc">' + item.description + '</p>';
        var brandElement = '<p class="itemBrand">' + item.brand + '</p>';
        var ctgElement = '<p class="itemCtg">' + item.ctg + '</p>';
        var cndElement = '<p class="itemCnd">' + item.cnd + '</p>';

        // Add the tools container to the item top-level div.
        divElement.append(toolsContainer);

        // Add the item elements to the item top-level div.
        divElement.append(imgElement);
        divElement.append(nameElement);
        divElement.append(descElement);
        divElement.append(brandElement);
        divElement.append(ctgElement);
        divElement.append(cndElement);

        // Add the item top-level div to the items container div.
        ELEM.items.append(divElement);

        // Set click handlers for the delete and edit icons.
        $('#' + item._id).find('#removeIcon').click(removeItem);
        $('#' + item._id).find('#editIcon').click(editItemHandler);
    });
}

function getRandomSize(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

// Handler for item icon clicked to delete an item.
// TODO add code to confirm if user wants to delete
// the item, and only proceed if they click yes.
function removeItem(event) {
    // Walk up the DOM from the delete icon (event.target)
    // to get to the item top-level div, which has the
    // item's id set on it.
    var itemToRemove = $(event.target).parent().parent();

    // Get the item's id value.
    var idOfItemToRemove = $(itemToRemove).attr('id');

    $.ajax({
        method: 'DELETE',
        url: 'http://localhost:3000/items/' + idOfItemToRemove,
        success: function() {
            // Regenerate items and now the deleted item will not appear,
            // because we removed the data for the item to remove.
            getItems('example@mail.com');
        }
        })
        .done(function( msg ) {
          alert( "Deleting item succeeded: " + msg );
        }); 
}

// Handler for item icon clicked to edit an item.
function editItemHandler(event) {
    saveMode = 'edit';
    
    // Set modal title to reflect we are in 'edit' mode.
    ELEM.addEditModalTitle.html('EDIT ITEM');
    
    
    // Get a reference to the current item top-level div.
    var itemToEdit = $(event.target).parent().parent();

    // Set the id of item to edit into the hidden field.
    var idOfItemToEdit = $(itemToEdit).attr('id');
    ELEM.idOfItemBeingEdited.val(idOfItemToEdit);

    // This is used to temporarily store data of item to edit.
    var dataOfItemToEdit = {};
    dataOfItemToEdit.img = $(itemToEdit).find('.itemImg').html();
    dataOfItemToEdit.name = $(itemToEdit).find('.itemName').html();
    dataOfItemToEdit.description = $(itemToEdit).find('.itemDesc').html();
    dataOfItemToEdit.brand = $(itemToEdit).find('.itemBrand').html();
    dataOfItemToEdit.ctg = $(itemToEdit).find('.itemCtg').html();
    dataOfItemToEdit.cnd = $(itemToEdit).find('.itemCnd').html();

    // If we found the item (and in general we always should),
    // use the data to set the fields of the modal used to edit the item.
    if (dataOfItemToEdit) {
        // ELEM.itemImg.val(dataOfItemToEdit.img);
        ELEM.itemName.val(dataOfItemToEdit.name);
        ELEM.itemDesc.val(dataOfItemToEdit.description);
        ELEM.itemBrand.val(dataOfItemToEdit.brand);
        ELEM.itemCtg.val(dataOfItemToEdit.ctg);
        ELEM.itemCnd.val(dataOfItemToEdit.cnd);
        // This makes the save button enabled, because now the fields have data (of item to edit).
        checkData();
    }
    
    
    // Show the modal.
    ELEM.addEditModal.modal('toggle');
}

// Reset the modal fields, and the item to edit id.
function resetValues() {
    ELEM.itemImg.val('');
    ELEM.itemName.val('');
    ELEM.itemDesc.val('');
    ELEM.itemBrand.val('');
    ELEM.itemCtg.val('');
    ELEM.itemCnd.val('');
    ELEM.idOfItemBeingEdited.val('');
    checkData(); 
}





