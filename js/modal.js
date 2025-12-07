const eduModal = document.getElementById("educationModal");
const openEduBtn = document.getElementById("openEducationModal");
const closeEduBtn = eduModal.querySelector(".modal_close");

openEduBtn.onclick = () => (eduModal.style.display = "block");
closeEduBtn.onclick = () => (eduModal.style.display = "none");

window.onclick = (e) => {
    if (e.target === eduModal) eduModal.style.display = "none";
};
