-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           11.8.2-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para banco_dados
CREATE DATABASE IF NOT EXISTS `banco_dados` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `banco_dados`;

-- Copiando estrutura para tabela banco_dados.administrador
CREATE TABLE IF NOT EXISTS `administrador` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(70) NOT NULL,
  `senha` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela banco_dados.administrador: ~1 rows (aproximadamente)
INSERT INTO `administrador` (`id`, `email`, `senha`) VALUES
	(1, 'adm@gmail.com', '12345');

-- Copiando estrutura para tabela banco_dados.alimentos
CREATE TABLE IF NOT EXISTS `alimentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `intolerante_lactose` tinyint(1) DEFAULT 0,
  `vegetariano` tinyint(1) DEFAULT 0,
  `vegano` tinyint(1) DEFAULT 0,
  `ovolacto` tinyint(1) DEFAULT 0,
  `imagem` varchar(255) DEFAULT NULL,
  `intolerante_gluten` tinyint(1) DEFAULT 0,
  `descricao` text DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `alimentos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela banco_dados.alimentos: ~38 rows (aproximadamente)
INSERT INTO `alimentos` (`id`, `nome`, `intolerante_lactose`, `vegetariano`, `vegano`, `ovolacto`, `imagem`, `intolerante_gluten`, `descricao`, `id_categoria`) VALUES
	(1, 'Soja', 1, 1, 1, 1, 'img/soja.jpg', 1, 'Rica em proteína vegetal, ferro e fibras. Fonte completa de aminoácidos. Receitas: hambúrguer de soja, strogonoff vegano, soja refogada, bowl proteico.', 1),
	(2, 'Tofu', 1, 1, 1, 1, 'img/tofu.jpg', 1, 'Fonte leve de proteína, cálcio e baixo teor de gordura. Absorve bem temperos. Receitas: tofu grelhado, tofu mexido, moqueca vegana, saladas.', 1),
	(3, 'Ovo', 1, 1, 0, 0, 'img/ovo.jpg', 1, 'Rico em proteína completa, vitaminas do complexo B e gorduras boas. Receitas: omelete, ovo cozido, ovo poché, ovo mexido, panquecas.', 1),
	(4, 'Carne', 1, 0, 0, 0, 'img/carne.jpg', 1, 'Rica em proteína animal, ferro heme e B12. Receitas: carne moída, picadinho, bife grelhado, ensopado', 1),
	(5, 'Leite Sem Lactose', 1, 1, 0, 0, 'img/leite_sem_lactose.jpg', 1, 'Mesmo valor nutricional do leite comum, porém sem lactose. Receitas: mingau, molho branco, vitaminas, panquecas.', 1),
	(6, 'Leite', 0, 0, 0, 0, 'img/leite.jpg', 1, 'Fonte de cálcio, proteína e vitaminas A e D. Receitas: bolos, mingau, panquecas, cremes.', 1),
	(7, 'Queijo', 0, 1, 0, 0, 'img/queijo.jpg', 1, 'Rico em cálcio, proteínas e gorduras. Receitas: omelete recheada, tapioca com queijo, lasanhas, gratinados.', 1),
	(8, 'Iogurte', 0, 1, 0, 0, 'img/iogurte.jpg', 1, 'Fonte de probióticos, cálcio e proteína. Receitas: parfait, molhos cremosos, smoothies.', 1),
	(9, 'Batata', 1, 1, 1, 1, 'img/batata.jpg', 1, 'Fonte de carboidratos, potássio e energia. Receitas: purê, assada, cozida, salada, batata recheada.', 2),
	(10, 'Mel', 1, 1, 0, 1, 'img/mel.jpg', 1, 'Adoçante natural com propriedades antioxidantes. Receitas: panquecas, marinadas, chás, mandioquinha caramelizada.', 2),
	(11, 'Feijão', 1, 1, 1, 1, 'img/feijão.jpg', 1, 'Rico em ferro vegetal, proteína e fibras. Receitas: feijão tropeiro, feijoada vegana, salada de feijão.', 1),
	(12, 'Lentilha', 1, 1, 1, 1, 'img/lentilha.jpg', 1, 'Fonte de proteína vegetal, ferro e fibras. Receitas: sopas, curry de lentilha, lentilha com arroz.', 1),
	(13, 'Grão-de-bico', 1, 1, 1, 1, 'img/grão-bico.jpg', 1, 'Rico em proteínas e fibras. Receitas: homus, salada, ensopado, hambúrguer de grão-de-bico.', 1),
	(14, 'Ervilha', 1, 1, 1, 1, 'img/ervilha.jpg', 1, 'Fonte de proteína vegetal, fibras e vitaminas. Receitas: sopa de ervilha, arroz com ervilha, saladas.', 1),
	(15, 'Quinoa', 1, 1, 1, 1, 'img/quinoa.jpeg', 1, 'Semente completa em aminoácidos e rica em minerais. Receitas: saladas, bowls, substituto do arroz, hambúrgueres veganos.', 1),
	(16, 'Aveia', 1, 1, 1, 1, 'img/aveia.jpg', 1, 'Rica em fibras (betaglucana), vitaminas e minerais. Receitas: mingau, panquecas, bolos, cookies.', 1),
	(17, 'Milho', 1, 1, 1, 1, 'img/milho.jpg', 1, 'Fonte de carboidratos, fibras e antioxidantes. Receitas: cuscuz, saladas, sopas, suflê de milho.', 2),
	(18, 'Arroz', 1, 1, 1, 1, 'img/arroz.jpg', 1, 'Base energética rica em carboidratos. Receitas: arroz branco, carreteiro, risotos, arroz de forno.', 2),
	(19, 'Amaranto', 1, 1, 1, 1, 'img/amaranto.jpg', 1, 'Grão rico em proteína, cálcio e ferro. Receitas: mingau, adicionar no arroz, pães e bolos.', 1),
	(20, 'Mandioca', 1, 1, 1, 1, 'img/mandioca.jpg', 1, 'Fonte de energia, sem glúten. Receitas: purê, caldo de mandioca, mandioca cozida, escondidinho.', 2),
	(21, 'Tapioca', 1, 1, 1, 1, 'img/tapioca.jpg', 1, 'Derivado da mandioca, leve e sem glúten. Receitas: tapioca recheada, crepioca, panquecas.', 2),
	(22, 'Inhame', 1, 1, 1, 1, 'img/inhame.jpg', 1, 'Rico em energia e vitaminas do complexo B. Receitas: purê, sopas, mingau de inhame, bolinhos.', 2),
	(23, 'Mandioquinha', 1, 1, 1, 1, 'img/mandioquinha.jpg', 1, 'Raiz suave rica em carboidratos. Receitas: caldo, purê, assada com mel, nhoque.', 2),
	(24, 'Macarrão', 1, 1, 1, 1, 'img/macarrão.jpg', 1, 'Fonte de carboidratos. Receitas: macarrão com lentilha, alho e óleo, macarronada tradicional.', 2),
	(25, 'Cuscuz', 1, 1, 1, 1, 'img/cuscuz.jpg', 1, 'Rico em carboidratos e fibras. Receitas: cuscuz nordestino, cuscuz com ovo, saladas frias.', 2),
	(26, 'Frutas', 1, 1, 1, 1, 'img/frutas.jpg', 1, 'Fontes de vitaminas, fibras e antioxidantes. Receitas: vitaminas, saladas de frutas, sobremesas.', 2),
	(27, 'Leite Vegetal', 1, 1, 1, 1, 'img/leite-vegetal.jpg', 1, 'Feito de grãos ou castanhas, livre de lactose. Receitas: mingaus, vitaminas, panquecas veganas.', 1),
	(28, 'Oleaginosas', 1, 1, 1, 1, 'img/oleaginosas.jpg', 0, 'Ricas em gorduras boas, minerais e proteínas. Receitas: granola, patês, toppings de salada.', 3),
	(29, 'Melado de Cana', 1, 1, 1, 1, 'img/melado-cana.jpg', 1, 'Adoçante natural rico em minerais. Receitas: bolos, pães, tapioca doce.', 2),
	(30, 'Rapadura', 1, 1, 1, 1, 'img/rapadura.jpg', 1, 'Rica em energia e minerais. Receitas: rapadura ralada em bolos, doces típicos.', 2),
	(31, 'Farinha', 1, 1, 1, 1, 'img/farinha.jpg', 0, 'Base para massas e pães. Receitas: bolos, pães, tortas, farofas.', 2),
	(32, 'Cevada', 1, 1, 1, 1, 'img/cevada.jpg', 0, 'Rica em fibras e vitaminas do complexo B. Receitas: sopas, mingau, pão de cevada.', 2),
	(33, 'Pão', 1, 1, 1, 1, 'img/pão.jpg', 0, 'Carboidrato prático para o dia a dia. Receitas: sanduíches, torradas, bruschettas.', 2),
	(34, 'Pão integral', 1, 1, 1, 1, 'img/pão-integral.jpg', 0, 'Rico em fibras e micronutrientes. Receitas: lanches saudáveis, torradas, mix com ovos.', 2),
	(35, 'Macarrão integral', 1, 1, 1, 1, 'img/macarrão-integral.jpg', 0, 'Mais nutritivo que o tradicional. Receitas: macarrão integral ao pesto, com legumes, ou com lentilha.', 2),
	(36, 'Pão de Fermentação Natural', 1, 1, 1, 1, 'img/pão-natural.jpg', 0, 'Mais leve, digestível e nutritivo. Receitas: sanduíches, bruschettas, torradas artesanais.', 2),
	(37, 'Brócolis', 1, 1, 1, 1, 'img/brocolis.jpg', 1, 'Rico em fibras, vitamina C, cálcio vegetal e antioxidantes. Auxilia na imunidade e na saúde intestinal. ', 2),
	(78, 'columbinna', 0, 1, 0, 0, 'uploads/1765218008178.webp', 0, 'deusa da lua', NULL);

-- Copiando estrutura para tabela banco_dados.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela banco_dados.categorias: ~3 rows (aproximadamente)
INSERT INTO `categorias` (`id`, `nome`, `imagem`) VALUES
	(1, 'Proteína', NULL),
	(2, 'Carboidrato', NULL),
	(3, 'Gordura', NULL);

-- Copiando estrutura para tabela banco_dados.favoritos
CREATE TABLE IF NOT EXISTS `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_alimento` int(11) NOT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`id_usuario`,`id_alimento`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_alimento` (`id_alimento`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_alimento`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela banco_dados.favoritos: ~21 rows (aproximadamente)
INSERT INTO `favoritos` (`id`, `id_usuario`, `id_alimento`, `data_criacao`) VALUES
	(41, 16, 3, '2025-12-02 11:51:32'),
	(163, 17, 3, '2025-12-02 16:20:12'),
	(164, 17, 7, '2025-12-02 16:20:51'),
	(165, 17, 9, '2025-12-02 16:21:01'),
	(166, 7, 4, '2025-12-02 16:26:40'),
	(167, 7, 6, '2025-12-02 16:26:48'),
	(168, 7, 7, '2025-12-02 16:26:51'),
	(169, 7, 8, '2025-12-02 16:26:54'),
	(170, 7, 9, '2025-12-02 16:26:55'),
	(171, 7, 16, '2025-12-02 16:27:01'),
	(172, 7, 18, '2025-12-02 16:27:03'),
	(173, 7, 20, '2025-12-02 16:27:05'),
	(174, 7, 24, '2025-12-02 16:27:08'),
	(179, 18, 18, '2025-12-02 16:31:09'),
	(180, 18, 29, '2025-12-02 16:34:59'),
	(183, 19, 2, '2025-12-02 16:38:04'),
	(184, 20, 4, '2025-12-02 16:52:26'),
	(185, 20, 5, '2025-12-02 16:52:35'),
	(186, 20, 27, '2025-12-02 16:53:01'),
	(187, 21, 24, '2025-12-02 16:57:20'),
	(209, 22, 3, '2025-12-04 13:55:01');

-- Copiando estrutura para tabela banco_dados.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(20) NOT NULL,
  `senha` varchar(8) NOT NULL,
  `email` varchar(80) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_usuario` (`nome_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela banco_dados.usuario: ~23 rows (aproximadamente)
INSERT INTO `usuario` (`id`, `nome_usuario`, `senha`, `email`, `foto_perfil`) VALUES
	(1, 'mariena', '1234567', '', NULL),
	(2, 'luiztxt', '12345678', '', NULL),
	(3, 'thata', '1234567', '', NULL),
	(4, 'barilebobo', '1234567', '', NULL),
	(6, 'clorinde', '1234r', '', NULL),
	(7, 'thalita', '07052008', '', NULL),
	(8, 'roberto', '1234', '', NULL),
	(9, 'nanatycca', 'Nataly@1', '', NULL),
	(10, 'lene', '134340', '', NULL),
	(11, 'aaa', 'aaa', '', NULL),
	(12, 'Mariana', '1234', '', NULL),
	(13, 'Maria Clara', '1234', '', NULL),
	(15, 'samuelxavier', '123456', '', NULL),
	(16, 'lulu', '1234', '', NULL),
	(17, 'oiee', '1234', '', NULL),
	(18, 'mavie', 'mavie12', '', NULL),
	(19, 'Luiz Henrique ', '1234', '', NULL),
	(20, 'eve', '123', '', NULL),
	(21, 'ricardo', '1234', '', NULL),
	(22, 'murillo', '12345', '', NULL),
	(23, 'lululu', '1234', 'luiz@gmail.com', NULL),
	(25, 'Mariana Rodrigues', '1234', 'mariana@gmail.com', NULL),
	(26, 'Luiz', '12345', 'luiz.lopes@gmail.com', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
