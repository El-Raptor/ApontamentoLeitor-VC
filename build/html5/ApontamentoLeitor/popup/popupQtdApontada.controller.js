angular
  .module("ApontamentoLeitorApp")
  .controller("popupQtdApontadaController", [
    "$scope",
    "$rootScope",
    "$popupInstance",
    function (
      $scope,
      $rootScope,
      $popupInstance
    ) {
      var self = this;

      setTimeout(function () {
        init();
      }, 2000);

      function init() {
        // Função keydown do campo de código de barraas
        let inputQtdApontada = document.getElementById("inputQtdApontada");
        inputQtdApontada.addEventListener("keydown", (e) => {
          let key = e.which || e.keyCode;
          //console.log(inputQtdApontada.value)
          if (key === 13) {
            // codigo da tecla enter ou tab
            setTimeout(function () {
              if (inputQtdApontada.value) {
                let peso;
                if (inputQtdApontada.value.length == 13) {
                  // Lê o código de barras do leitor e transforma em um peso.
                  peso = inputQtdApontada.value.substring(7, 11) + '.' + inputQtdApontada.value.substring(11, 12)
                  console.log(peso)
                } else {
                  peso = inputQtdApontada.value
                }
            
                $popupInstance.success({
                  resposta: peso
                });
              }
            }, 50);
            //inputQtdApontada.value = "";
          }
        });
      }

    },
  ]);
