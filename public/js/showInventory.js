document.addEventListener("DOMContentLoaded", () => {
  // Fetch and display current equipment
  fetchMethod(
    "/api/equipment",
    (status, data) => {
      if (status === 200) {
        // Update the equipment section with the fetched data
        const equipment = data; // Assuming the response contains an array of equipped items
        equipment.forEach(item => {
          const itemType = item.type; // Item type will determine the slot
          const itemName = item.name;
          const itemStats = item.stat_type === 'none' ? `${item.stat_bonus}` : `${item.stat_bonus} ${item.stat_type}`;
          
          // Create unequip button for each equipped item
          let unequipButton = `<button class="btn btn-danger unequip-button" data-equipment-id="${item.equipment_id}">Unequip</button>`;
          
          switch(itemType) {
            case 'weapon':
              document.getElementById('equipped-weapon-name').textContent = `Weapon: ${itemName}`;
              document.getElementById('equipped-weapon-stats').textContent = itemStats;
              document.getElementById('equipped-weapon-unequip').innerHTML = unequipButton;  // Add unequip button
              break;
            case 'armor':
              document.getElementById('equipped-armor-name').textContent = `Armor: ${itemName}`;
              document.getElementById('equipped-armor-stats').textContent = itemStats;
              document.getElementById('equipped-armor-unequip').innerHTML = unequipButton;  // Add unequip button
              break;
            case 'shield':
              document.getElementById('equipped-shield-name').textContent = `Shield: ${itemName}`;
              document.getElementById('equipped-shield-stats').textContent = itemStats;
              document.getElementById('equipped-shield-unequip').innerHTML = unequipButton;  // Add unequip button
              break;
            case 'accessory':
              document.getElementById('equipped-accessory-name').textContent = `Accessory: ${itemName}`;
              document.getElementById('equipped-accessory-stats').textContent = itemStats;
              document.getElementById('equipped-accessory-unequip').innerHTML = unequipButton;  // Add unequip button
              break;
            default:
              console.warn('Unknown equipment type:', itemType);
          }
        });
        
        // Add event listeners for unequip buttons
        const unequipButtons = document.querySelectorAll('.unequip-button');
        unequipButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            const equipmentId = e.target.getAttribute('data-equipment-id');
            unequipItem(equipmentId); // Call the unequipItem function when clicked
          });
        });
        
      } else {
        console.error("Error fetching equipment data:", status);
      }
    },
    "GET",
    null,
    localStorage.getItem("token")
  );

  // Fetch and display inventory items
  fetchMethod(
    "/api/inventory",
    (status, data) => {
      if (status === 200) {
        const inventoryContainer = document.getElementById("inventory-container");
        inventoryContainer.innerHTML = ""; // Clear existing inventory items

        // Loop through inventory items and create cards for each one
        data.forEach(item => {
          const itemCard = document.createElement("div");
          itemCard.classList.add("col-md-3", "mb-4");
          
          // Only show stat_type if it's not 'none'
          const itemStats = item.stat_type === 'none' ? `${item.stat_bonus}` : `${item.stat_bonus} ${item.stat_type}`;

          // Create item card with equip button if the stat_bonus is greater than 0
          let equipButton = '';
          if (item.stat_bonus > 0) {
            equipButton = `<button class="btn btn-primary equip-button" data-item-id="${item.item_id}" data-item-type="${item.type}">Equip</button>`;
          }

          itemCard.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">Type: ${item.type}</p>
                <p class="card-text">${item.description}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Stat Bonus:</strong> ${itemStats}</p>
                ${equipButton}  <!-- Show equip button if stat_bonus > 0 -->
              </div>
            </div>
          `;
          
          // Append the card to the inventory container
          inventoryContainer.appendChild(itemCard);
        });

        // Add event listeners for equip buttons
        const equipButtons = document.querySelectorAll('.equip-button');
        equipButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-item-id');
            const itemType = e.target.getAttribute('data-item-type');
            equipItem(itemId, itemType); // Call the equipItem function when clicked
          });
        });
      } else {
        console.error("Error fetching inventory data:", status);
      }
    },
    "GET",
    null,
    localStorage.getItem("token")
  );

  // Equip item function
  function equipItem(itemId, itemType) {
    // Make a request to equip the item
    fetchMethod(
      `/api/equipment`,
      (status, data) => {
        if (status === 200) {
          location.reload(); // Reload the page to show updated equipment
        } else {
          console.error("Error equipping item:", status);
        }
      },
      "PUT",
      { item_id: itemId, item_type: itemType },
      localStorage.getItem("token")
    );
  }

  // Unequip item function
  function unequipItem(equipmentId) {
    // Make a request to unequip the item
    fetchMethod(
      `/api/equipment/unequip`,  // Endpoint for unequipping
      (status, data) => {
        if (status === 200) {
          location.reload(); // Reload the page to show updated equipment
        } else {
          console.error("Error unequipping item:", status);
        }
      },
      "PUT",
      { equipment_id: equipmentId },
      localStorage.getItem("token")
    );
  }
});
