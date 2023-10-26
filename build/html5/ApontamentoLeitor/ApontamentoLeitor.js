angular
  .module("ApontamentoLeitorApp", ["snk"])
  .controller("ApontamentoLeitorController", [
    "$scope",
    "$rootScope",
    "ObjectUtils",
    "SkApplicationInstance",
    "ServiceProxy",
    "MessageUtils",
    "i18n",
    "SanPopup",
    "SkApplicationInstance",

    function (
      $scope,
      $rootScope,
      ObjectUtils,
      SkApplicationInstance,
      ServiceProxy,
      MessageUtils,
      i18n,
      SanPopup,
      SkApplicationInstance
    ) {
      let self = this;
      setTimeout(function () {
        init();
      }, 2000);

      $scope.statusMsg = {
        "Sucesso": "Apontamento realizado com sucesso!",
        "Falha": "Apontamento não realizado!"
      };

      $scope.success = true;

      function init() {
        const snackbar = document.getElementById("snackbar");
        // Função keydown do campo de código de barras
        let inputCodBarra = document.getElementById("inputBarras");
        inputCodBarra.focus();
        inputCodBarra.addEventListener("keydown", (e) => {
          let key = e.which || e.keyCode;
          if (key === 13) {
            // codigo da tecla enter ou tab
            setTimeout(function () {
              $scope.statusMsg.Falha = "Apontamento não realizado!";
              if (inputCodBarra.value) {
                let codbarras = inputCodBarra.value;
                let params = { CODBARRAS: codbarras };
                ServiceProxy.callService(
                  "apontamentoleitor@ApontamentoLeitorSP.apontarProducao",
                  params
                ).then((response) => {
                  let resultado = ObjectUtils.getProperty(
                    response,
                    "responseBody.response"
                  );

                  // Retorno do serviço informa que esse volume já foi apontado.
                  if (resultado.statusResposta === 3) {

                    $scope.success = false;
                    $scope.statusMsg.Falha = $scope.statusMsg.Falha + " " + resultado.valores;
                    snackbar.className = "fail";

                    setTimeout(() => { snackbar.className = snackbar.className.replace("fail", ""); }, 3000)
                    return;
                    //console.log(resultado.IDIATV);
                  }

                  // Retorno do serviço informa que o código de barras não existe
                  if (resultado.statusResposta === 0) {

                    $scope.success = false;
                    $scope.statusMsg.Falha = $scope.statusMsg.Falha + " " + resultado.valores;
                    snackbar.className = "fail";

                    setTimeout(() => { snackbar.className = snackbar.className.replace("fail", ""); }, 3000)
                    return;
                  }

                  // Retorno do serviço informa que a operação de produção desse volume ainda não foi inicializada.
                  if (resultado.statusResposta === 4) {

                    $scope.success = false;
                    $scope.statusMsg.Falha = $scope.statusMsg.Falha + " " + resultado.valores;
                    snackbar.className = "fail";

                    setTimeout(() => { snackbar.className = snackbar.className.replace("fail", ""); }, 3000)
                    return;
                  }

                  // Retorno do serviço informa que a unidade de medida dessa operação de produção desse volume 
                  // não permite apontamento por leitor.
                  if (resultado.statusResposta === 5) {

                    $scope.success = false;
                    $scope.statusMsg.Falha = $scope.statusMsg.Falha + " " + resultado.valores;
                    snackbar.className = "fail";

                    setTimeout(() => { snackbar.className = snackbar.className.replace("fail", ""); }, 3000)
                    return;
                  }

                  // Retorno do serviço informa que não houve quantidade apontada (2)
                  // ou que o volume foi definido para apontamento offline.
                  if (resultado.statusResposta === 2 || resultado.statusResposta === 6) {
                    return SanPopup.open({
                      title: "Quantidade Apontada",
                      templateUrl:
                        "html5/ApontamentoLeitor/popup/popupQtdApontada.tpl.html",
                      controller: "popupQtdApontadaController",
                      controllerAs: "ctrl",
                      type: "brand",
                      size: "alert",
                      grayBG: true,
                      showBtnNo: false,
                      showBtnOk: false,
                      showBtnCancel: false,
                      showIconClose: false,
                    }).result.then(function (result) {
                      params.QTDAPONT = result.resposta;
                      // Chamada do serviço apontamenot leitor.
                      ServiceProxy.callService(
                        "apontamentoleitor@ApontamentoLeitorSP.apontarProducao",
                        params
                      ).then((response) => {
                        resultado = ObjectUtils.getProperty(
                          response,
                          "responseBody.response"
                        );
                        params.NUAPO = resultado.valores.NUAPO;
                        confirmaApt(resultado, params);

                        console.log("NUAPO PopUp")
                        console.log(resultado.valores.NUAPO)

                        $scope.success = true;
                        snackbar.className = "success";

                        setTimeout(() => { snackbar.className = snackbar.className.replace("success", ""); }, 3000);
                      })
                    });
                  }
                  if (resultado.statusResposta === 1) {
                    params.NUAPO = resultado.valores.NUAPO;
                    confirmaApt(resultado, params);

                    $scope.success = true;
                    snackbar.className = "success";

                    setTimeout(() => { snackbar.className = snackbar.className.replace("success", ""); }, 3000)
                  }
                });
              } else {
                MessageUtils.showError(
                  "Erro",
                  "O campo do código de barras não pode ser vazio!"
                );
              }
              inputCodBarra.value = "";
            }, 50);
          }
        });
      }

      // Chama o serviço que confirma o apontamento de produção.
      function confirmaApt(resultado, params) {
        reqBody = {
          params: {
            NUAPO: resultado.valores.NUAPO,
            IDIATV: resultado.valores.IDIATV,
            ACEITARQTDMAIOR: false,
            ULTIMOAPONTAMENTO: false,
            RESPOSTA_ULTIMO_APONTAMENTO: false,
          },
          clientEventList: {
            clientEvent: [
              {
                $: "br.com.sankhya.mgeprod.apontamentos.divergentes",
              },
              {
                $: "br.com.sankhya.mgeProd.wc.indisponivel",
              },
              {
                $: "br.com.sankhya.mgeprod.redimensionar.op.pa.perda",
              },
              {
                $: "br.com.sankhya.mgeprod.redimensionar.op.pa.avisos",
              },
              {
                $: "br.com.sankhya.mgeprod.trocaturno.avisos",
              },
              {
                $: "br.com.sankhya.mgeprod.finalizar.liberacao.desvio.pa",
              },
              {
                $: "br.com.sankhya.actionbutton.clientconfirm",
              },
              {
                $: "br.com.sankhya.mgeProd.apontamento.ultimo",
              },
              {
                $: "br.com.sankhya.mgeprod.operacaoproducao.mpalt.proporcao.apontamento.invalida",
              },
              {
                $: "br.com.sankhya.mgeProd.apontamento.liberaNroSerie",
              },
              {
                $: "br.com.sankhya.prod.remove.apontamento.pesagemvolume",
              },
              {
                $: "br.com.sankhya.mgeprod.confirma.ultimo.apontamento.mp.fixo",
              },
              {
                $: "br.com.sankhya.apontamentomp.naoreproporcionalizado",
              },
              {
                $: "br.com.sankhya.mgeprod.operacaoproducao.mpalt.apontamentomp.qtdmistura.naoatendido",
              },
              {
                $: "br.com.sankhya.mgeprod.apontamentos.divergentes",
              },
              {
                $: "br.com.sankhya.mgeProd.wc.indisponivel",
              },
              {
                $: "br.com.sankhya.mgeprod.redimensionar.op.pa.perda",
              },
              {
                $: "br.com.sankhya.mgeprod.redimensionar.op.pa.avisos",
              },
              {
                $: "br.com.sankhya.mgeprod.trocaturno.avisos",
              },
              {
                $: "br.com.sankhya.mgeprod.finalizar.liberacao.desvio.pa",
              },
              {
                $: "br.com.sankhya.actionbutton.clientconfirm",
              },
              {
                $: "br.com.sankhya.mgeProd.apontamento.ultimo",
              },
              {
                $: "br.com.sankhya.mgeprod.operacaoproducao.mpalt.proporcao.apontamento.invalida",
              },
              {
                $: "br.com.sankhya.mgeProd.apontamento.liberaNroSerie",
              },
              {
                $: "br.com.sankhya.prod.remove.apontamento.pesagemvolume",
              },
              {
                $: "br.com.sankhya.mgeprod.confirma.ultimo.apontamento.mp.fixo",
              },
              {
                $: "br.com.sankhya.apontamentomp.naoreproporcionalizado",
              },
              {
                $: "br.com.sankhya.mgeprod.operacaoproducao.mpalt.apontamentomp.qtdmistura.naoatendido",
              },
            ],
          },
        };

        ServiceProxy.callService(
          "mgeprod@OperacaoProducaoSP.confirmarApontamento",
          reqBody
        ).then((resp) => {
          const result = ObjectUtils.getProperty(
            resp,
            "responseBody.pk.NUNOTA"
          );
        });
      }
    },
  ]);
